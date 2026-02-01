import mongoose from "mongoose";

/**
 * Craft Model
 * Represents different craft categories for "Shop by Craft" feature
 * e.g., Bamboo & Cane, Handloom, Pottery, Tea, Spices, Jewelry
 */
const craftSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },

    // Display
    description: { type: String },
    shortDescription: { type: String, maxlength: 100 },
    emoji: { type: String, default: '🎨' },

    // Image
    image: {
        url: { type: String },
        altText: { type: String }
    },
    bannerImage: {
        url: { type: String },
        altText: { type: String }
    },

    // Associated states (where this craft is prominent)
    prominentStates: [{
        type: String,
        enum: ['Assam', 'Meghalaya', 'Nagaland', 'Manipur', 'Mizoram', 'Arunachal Pradesh', 'Tripura', 'Sikkim']
    }],

    // Story/History of this craft
    history: { type: String },

    // FAQ for collection page
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],

    // Stats (auto-calculated)
    productCount: { type: Number, default: 0 },
    artisanCount: { type: Number, default: 0 },

    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }

}, { timestamps: true });

// Indexes
craftSchema.index({ slug: 1 });
craftSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("Craft", craftSchema);
