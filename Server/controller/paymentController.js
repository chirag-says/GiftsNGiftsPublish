import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../model/payment.js';
import Product from '../model/addproduct.js';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * SECURITY FIX: Server-Side Price Calculation
 * 
 * VULNERABILITY PATCHED:
 * Previously: Client sent `amount` which could be manipulated (e.g., buying ₹5000 products for ₹1)
 * 
 * NOW: 
 * 1. Client sends ONLY item IDs and quantities
 * 2. Server fetches REAL prices from MongoDB
 * 3. Server calculates the total - CLIENT CANNOT MANIPULATE PRICES
 * 
 * @param {Object} req.body.items - Array of { productId, quantity }
 */
export const checkout = async (req, res) => {
  try {
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
          throw new Error(`Insufficient stock for ${product.title}. Available: ${product.stock}`);
        }

        return {
          productId: item.productId,
          title: product.title,
          unitPrice: product.price,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity
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
    const options = {
      amount: Math.round(serverCalculatedTotal * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        itemCount: items.length,
        calculatedAt: new Date().toISOString()
      }
    };

    const order = await instance.orders.create(options);

    // Return order details along with calculated breakdown for frontend display
    res.status(200).json({
      success: true,
      order,
      breakdown: {
        items: lineItems,
        total: serverCalculatedTotal,
        totalInPaise: options.amount
      }
    });

  } catch (err) {
    console.error("Checkout Error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to create order"
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await Payment.create({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

      // PRODUCTION FIX: Use environment variable for frontend URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/payment-success?reference=${razorpay_payment_id}`);

    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRazorpayKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};
