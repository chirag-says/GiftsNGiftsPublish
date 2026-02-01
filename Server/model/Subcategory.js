/**
 * Subcategory Model
 * Linked to Category with image support
 */
import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
    subcategory: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    description: {
        type: String,
        default: ''
    },

    // Image for subcategory
    image: {
        url: { type: String, default: '' },
        altText: { type: String, default: '' }
    },

    // Display control
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },

    // Stats
    productCount: { type: Number, default: 0 }

}, { timestamps: true });

// Pre-save hook to generate slug
SubcategorySchema.pre('save', function (next) {
    if (this.isModified('subcategory') || !this.slug) {
        this.slug = this.subcategory
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Indexes
SubcategorySchema.index({ category: 1, isActive: 1 });
SubcategorySchema.index({ slug: 1 });

const Subcategory = mongoose.model('Subcategory', SubcategorySchema);
export default Subcategory;
