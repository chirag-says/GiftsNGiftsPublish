import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../model/payment.js';
import Product from '../model/addproduct.js';
import Order from '../model/order.js';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Check if MongoDB supports transactions (requires replica set)
 * Returns true if transactions are available
 */
const isReplicaSet = async () => {
  try {
    // MongoDB Atlas and replica sets support transactions
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    return serverStatus.repl !== undefined;
  } catch {
    return false;
  }
};

/**
 * SECURITY FIX: Server-Side Price Calculation
 * 
 * VULNERABILITY PATCHED:
 * 1. Client-side price manipulation - Server now calculates total from DB
 * 2. Stock validation before order creation
 * 
 * NOTE: Transactions are used when available (MongoDB replica set)
 * Falls back to non-transactional mode for standalone MongoDB
 * 
 * @param {Object} req.body.items - Array of { productId, quantity }
 */
export const checkout = async (req, res) => {
  try {
    console.log("[Checkout] Request body:", JSON.stringify(req.body, null, 2));
    console.log("[Checkout] User ID:", req.userId);

    const { items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid request: items array is required"
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: "Invalid item: productId and quantity (>= 1) are required"
        });
      }
    }

    // CRITICAL: Fetch REAL prices from database - NEVER trust client prices
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId).select('price title stock');

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        return {
          productId: item.productId,
          title: product.title,
          unitPrice: product.price,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
          currentStock: product.stock
        };
      })
    );

    // Calculate server-side total using TRUSTED database prices
    const serverCalculatedTotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

    // Validate minimum order amount (Razorpay minimum is ₹1)
    if (serverCalculatedTotal < 1) {
      return res.status(400).json({
        success: false,
        error: "Order total must be at least ₹1"
      });
    }

    // Create Razorpay order with SERVER-CALCULATED amount
    // NOTE: Receipt must be max 40 characters per Razorpay API
    const receiptId = `ord_${Date.now().toString(36)}`;

    const options = {
      amount: Math.round(serverCalculatedTotal * 100), // Convert to paise
      currency: "INR",
      receipt: receiptId.substring(0, 40), // Ensure max 40 chars
      notes: {
        userId: req.userId || 'guest',
        itemCount: items.length,
        calculatedAt: new Date().toISOString()
      }
    };

    const razorpayOrder = await instance.orders.create(options);

    // Return order details along with calculated breakdown for frontend display
    res.status(200).json({
      success: true,
      order: razorpayOrder,
      breakdown: {
        items: lineItems.map(item => ({
          productId: item.productId,
          title: item.title,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal
        })),
        total: serverCalculatedTotal,
        totalInPaise: options.amount
      }
    });

  } catch (err) {
    console.error("Checkout Error:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    res.status(500).json({
      success: false,
      error: err.message || "Failed to create order"
    });
  }
};

/**
 * Payment Verification
 * 
 * SECURITY FIXES:
 * 1. Replay Protection - Check if payment was already processed
 * 2. Signature Verification - Razorpay webhook security
 */
export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // REPLAY PROTECTION: Check if this payment was already processed
    const existingPayment = await Payment.findOne({ razorpay_payment_id });

    if (existingPayment) {
      // Return success anyway - this is a duplicate callback, payment was already processed
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/payment-success?reference=${razorpay_payment_id}&duplicate=true`);
    }

    // SIGNATURE VERIFICATION
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Possible tampering detected."
      });
    }

    // Create payment record
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      verifiedAt: new Date()
    });

    // Redirect to success page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/payment-success?reference=${razorpay_payment_id}`);

  } catch (err) {
    console.error("Payment Verification Error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Payment verification failed"
    });
  }
};

/**
 * Complete Order with Stock Deduction (with optional transaction support)
 * 
 * This function is called AFTER payment is verified to:
 * 1. Deduct stock atomically
 * 2. Create the order record
 * 
 * Uses transactions when MongoDB replica set is available
 */
export const completeOrderWithStockDeduction = async (orderData, userId) => {
  const useTransactions = await isReplicaSet();

  if (useTransactions) {
    // Use transaction for atomic operations
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // Deduct stock for each item
      for (const item of orderData.items) {
        const result = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true, session }
        );

        if (!result) {
          throw new Error(`Failed to deduct stock for product ${item.productId}`);
        }
      }

      // Create order
      const order = await Order.create([{
        user: userId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentId: orderData.paymentId,
        status: 'Confirmed',
        placedAt: new Date()
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return order[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    // Non-transactional mode (for standalone MongoDB)
    // Deduct stock for each item
    for (const item of orderData.items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!result) {
        throw new Error(`Failed to deduct stock for product ${item.productId}`);
      }
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentId: orderData.paymentId,
      status: 'Confirmed',
      placedAt: new Date()
    });

    return order;
  }
};

export const getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};
