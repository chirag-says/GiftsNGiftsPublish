import mongoose from "mongoose";

/**
 * B2B Order Model
 * Corporate gifting orders with timeline tracking
 */
const b2bOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },

    // User/Company
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    companyInfo: {
        companyName: { type: String, required: true },
        gstNumber: { type: String },
        panNumber: { type: String },
        billingContact: {
            name: { type: String },
            email: { type: String },
            phone: { type: String }
        },
        billingAddress: {
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String }
        }
    },

    // Delivery Details
    deliveryType: {
        type: String,
        enum: ['single', 'multiple'],
        default: 'single'
    },
    shippingAddress: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        contactPerson: { type: String },
        phone: { type: String }
    },

    // Multiple recipients (if deliveryType is 'multiple')
    recipientList: [{
        name: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        phone: { type: String },
        email: { type: String }
    }],

    // Order Items
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        title: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
        totalPrice: { type: Number },
        image: { type: String }
    }],

    // Customization
    customization: {
        addLogo: { type: Boolean, default: false },
        logoFile: { type: String }, // Cloudinary URL
        customMessage: { type: String },
        premiumPackaging: { type: Boolean, default: false },
        greetingCard: { type: Boolean, default: false }
    },

    // Pricing
    pricing: {
        itemsTotal: { type: Number },
        bulkDiscount: { type: Number, default: 0 },
        customizationCost: { type: Number, default: 0 },
        shippingCost: { type: Number, default: 0 },
        subtotal: { type: Number },
        gst: { type: Number },
        grandTotal: { type: Number }
    },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['online', 'invoice', 'bank_transfer'],
        default: 'online'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        invoiceNumber: { type: String },
        invoiceDate: { type: Date },
        dueDate: { type: Date }
    },

    // Order Timeline (for tracking)
    timeline: [{
        step: { type: String },
        title: { type: String },
        description: { type: String },
        date: { type: Date },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'logo_approval', 'production', 'quality_check', 'dispatched', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // Tracking
    trackingNumber: { type: String },
    courierPartner: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },

    // Notes
    adminNotes: { type: String },
    customerNotes: { type: String },

    // Associated Occasion
    occasion: { type: String }

}, { timestamps: true });

// Indexes
b2bOrderSchema.index({ orderId: 1 });
b2bOrderSchema.index({ userId: 1, createdAt: -1 });
b2bOrderSchema.index({ status: 1 });
b2bOrderSchema.index({ 'companyInfo.companyName': 1 });

export default mongoose.model("B2BOrder", b2bOrderSchema);
