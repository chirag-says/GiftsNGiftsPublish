import mongoose from "mongoose";

const categoryRequestSchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true,
        trim: true
    },
    // Image stored temporarily until approved
    image: {
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public ID for deletion if rejected
        altText: { type: String, default: '' }
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
        default: '' // Optional reason/description for the category
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
categoryRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const CategoryRequest = mongoose.model("CategoryRequest", categoryRequestSchema);
export default CategoryRequest;
