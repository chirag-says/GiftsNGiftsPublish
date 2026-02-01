/**
 * GiftFor Model (Relationship-based gifting)
 * Used for "Shop by Relation" / "Gift For" feature
 * Admin can manage relationships with images, descriptions, etc.
 */
import mongoose from "mongoose";

const giftForSchema = new mongoose.Schema({
    name: {
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

    // Category for grouping (Family, Romantic, Friends, Professional, etc.)
    category: {
        type: String,
        enum: ['family', 'romantic', 'friends', 'professional', 'age-gender', 'special'],
        default: 'family'
    },

    description: {
        type: String,
        default: ''
    },
    emoji: {
        type: String,
        default: '🎁'
    },

    // Image for the card/banner
    image: {
        url: { type: String, default: '' },
        altText: { type: String, default: '' }
    },

    // SEO fields
    metaTitle: { type: String },
    metaDescription: { type: String },

    // Stats (auto-updated)
    productCount: { type: Number, default: 0 },

    // Display control
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }

}, { timestamps: true });

// Pre-save hook to generate slug
giftForSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

// Indexes
giftForSchema.index({ category: 1, isActive: 1 });
giftForSchema.index({ slug: 1 });
giftForSchema.index({ displayOrder: 1 });

export default mongoose.model("GiftFor", giftForSchema);
