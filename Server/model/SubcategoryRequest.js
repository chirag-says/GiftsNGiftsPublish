import mongoose from "mongoose";

const subcategoryRequestSchema = new mongoose.Schema({
    subcategory: {
        type: String,
        required: true,
        trim: true
    },
    // Parent category reference
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categoryName: {
        type: String,
        required: true // Store category name for easy display
    },
    // Seller who requested
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerEmail: {
        type: String,
        required: true
    },
    // Request details
    reason: {
        type: String,
        default: '' // Optional reason/description for the subcategory
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // Admin response
    adminResponse: {
        type: String,
        default: '' // Reason for rejection or any note
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: {
        type: Date
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
subcategoryRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const SubcategoryRequest = mongoose.model("SubcategoryRequest", subcategoryRequestSchema);
export default SubcategoryRequest;
