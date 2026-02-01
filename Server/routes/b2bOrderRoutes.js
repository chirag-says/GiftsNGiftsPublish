/**
 * B2B Order Routes
 * Corporate gifting checkout and order management
 */
import express from 'express';
import userAuth from '../middleware/userAuth.js';
import addproductmodel from '../model/addproduct.js';
import B2BOrder from '../model/B2BOrder.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/logos/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf|ai|eps/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /image\/(jpeg|jpg|png)|application\/(pdf|postscript)/.test(file.mimetype);
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (PNG, JPEG) and vector files (AI, PDF) are allowed!'));
    }
});

/**
 * POST /api/orders/b2b-checkout
 * Process B2B corporate checkout
 */
router.post('/b2b-checkout', userAuth, upload.single('logoFile'), async (req, res) => {
    try {
        const {
            companyInfo,
            deliveryType,
            shippingAddress,
            recipientList,
            customization,
            paymentMethod,
            items
        } = req.body;

        // Parse JSON strings
        const parsedCompanyInfo = typeof companyInfo === 'string' ? JSON.parse(companyInfo) : companyInfo;
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        const parsedCustomization = typeof customization === 'string' ? JSON.parse(customization) : customization;
        const parsedShippingAddress = shippingAddress ? (typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress) : null;
        const parsedRecipientList = recipientList ? (typeof recipientList === 'string' ? JSON.parse(recipientList) : recipientList) : [];

        // Validate items
        if (!parsedItems || parsedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            });
        }

        // Fetch actual products to calculate total (prevent price manipulation)
        const productIds = parsedItems.map(item => item.productId);
        const products = await addproductmodel.find({ _id: { $in: productIds } });

        if (products.length !== parsedItems.length) {
            return res.status(400).json({
                success: false,
                message: 'Some products not found'
            });
        }

        // Calculate order total
        let itemsTotal = 0;
        let totalQuantity = 0;
        const orderItems = [];

        for (const item of parsedItems) {
            const product = products.find(p => p._id.toString() === item.productId);
            if (!product) continue;

            const quantity = parseInt(item.quantity) || 1;
            const lineTotal = product.price * quantity;
            itemsTotal += lineTotal;
            totalQuantity += quantity;

            orderItems.push({
                productId: product._id,
                title: product.title,
                price: product.price,
                quantity: quantity,
                lineTotal: lineTotal
            });
        }

        // Calculate bulk discount
        let discountPercent = 0;
        if (totalQuantity >= 500) discountPercent = 20;
        else if (totalQuantity >= 100) discountPercent = 15;
        else if (totalQuantity >= 50) discountPercent = 10;
        else if (totalQuantity >= 25) discountPercent = 5;

        const bulkDiscount = (itemsTotal * discountPercent) / 100;

        // Calculate customization costs
        let customizationCost = 0;
        if (parsedCustomization) {
            if (parsedCustomization.addLogo) customizationCost += 50 * totalQuantity;
            if (parsedCustomization.premiumPackaging) customizationCost += 30 * totalQuantity;
            if (parsedCustomization.giftWrap) customizationCost += 20 * totalQuantity;
        }

        const subtotal = itemsTotal - bulkDiscount + customizationCost;
        const gst = subtotal * 0.18;
        const grandTotal = subtotal + gst;

        // Generate order ID
        const orderId = `GNG-B2B-${Date.now().toString().slice(-8)}`;

        // Create order object (you would save this to a B2B Orders collection)
        const orderData = {
            orderId,
            userId: req.user._id,
            companyInfo: parsedCompanyInfo,
            deliveryType,
            shippingAddress: parsedShippingAddress,
            recipientList: parsedRecipientList,
            customization: {
                ...parsedCustomization,
                logoFile: req.file ? req.file.filename : null
            },
            items: orderItems,
            pricing: {
                itemsTotal,
                totalQuantity,
                discountPercent,
                bulkDiscount,
                customizationCost,
                subtotal,
                gst,
                grandTotal
            },
            paymentMethod,
            status: 'pending',
            timeline: [
                { step: 'Order Placed', date: new Date(), completed: true },
                { step: 'Logo Approval', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false },
                { step: 'Production Starts', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: false },
                { step: 'Quality Check', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false },
                { step: 'Dispatch', date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), completed: false },
                { step: 'Delivery', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false }
            ],
            createdAt: new Date()
        };

        // Save to B2B Orders collection
        const b2bOrder = new B2BOrder(orderData);
        await b2bOrder.save();

        // Send confirmation emails (would be implemented with nodemailer)
        // await sendB2BOrderConfirmation(b2bOrder, parsedCompanyInfo.billingContact.email);

        res.json({
            success: true,
            orderId: orderId,
            orderDetails: {
                ...orderData,
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            message: 'Order placed successfully'
        });

    } catch (error) {
        console.error('B2B Checkout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Checkout failed. Please try again.'
        });
    }
});

/**
 * POST /api/orders/bulk-quote
 * Request a custom quote for bulk orders
 */
router.post('/bulk-quote', async (req, res) => {
    try {
        const {
            companyName,
            contactName,
            email,
            phone,
            occasion,
            quantity,
            budget,
            deadline,
            requirements,
            productInterests
        } = req.body;

        // Validate required fields
        if (!companyName || !contactName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        const quoteId = `QT-${Date.now().toString().slice(-8)}`;

        // TODO: Save to Bulk Quote collection
        // TODO: Send email notification to sales team
        // TODO: Send confirmation email to customer

        const quoteData = {
            quoteId,
            companyName,
            contactName,
            email,
            phone,
            occasion,
            quantity,
            budget,
            deadline,
            requirements,
            productInterests,
            status: 'pending',
            createdAt: new Date()
        };

        res.json({
            success: true,
            quoteId: quoteId,
            message: 'Quote request submitted successfully. Our team will contact you within 24 hours.',
            data: quoteData
        });

    } catch (error) {
        console.error('Bulk Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quote request'
        });
    }
});

/**
 * GET /api/orders/b2b/:orderId
 * Get B2B order details
 */
router.get('/b2b/:orderId', userAuth, async (req, res) => {
    try {
        const { orderId } = req.params;

        // Fetch from B2B Orders collection
        const order = await B2BOrder.findOne({ orderId, userId: req.user._id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Get B2B Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order details'
        });
    }
});

export default router;
