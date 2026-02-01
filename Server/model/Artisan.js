import mongoose from "mongoose";

/**
 * Artisan Model
 * Stores artisan profiles for "Meet the Makers" feature
 * Each artisan has their story, craft, region, and associated products
 */
const artisanSchema = new mongoose.Schema({
    // Basic Info
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    profileImage: {
        url: { type: String, required: true },
        altText: { type: String, default: '' }
    },

    // Location
    state: {
        type: String,
        required: true,
        enum: ['Assam', 'Meghalaya', 'Nagaland', 'Manipur', 'Mizoram', 'Arunachal Pradesh', 'Tripura', 'Sikkim']
    },
    village: { type: String },
    district: { type: String },

    // Craft Details
    craftType: {
        type: String,
        required: true,
        enum: [
            'Handloom & Textiles', 'Bamboo & Cane', 'Pottery & Ceramics',
            'Jewelry & Ornaments', 'Wood Carving', 'Metal Craft',
            'Tea Production', 'Organic Farming', 'Weaving', 'Embroidery',
            'Natural Dyes', 'Silk Production', 'Other'
        ]
    },
    specialization: { type: String }, // e.g., "Muga Silk Weaving"
    yearsOfExperience: { type: Number, default: 0 },

    // Story Content
    shortBio: { type: String, maxlength: 200 }, // Brief intro for cards
    fullStory: { type: String }, // Complete artisan story (markdown supported)
    quote: { type: String }, // Featured quote from artisan

    // Craft Process
    craftProcess: [{
        step: { type: Number },
        title: { type: String },
        description: { type: String },
        image: { type: String }
    }],

    // Care Instructions for products
    careInstructions: [{
        title: { type: String },
        description: { type: String }
    }],

    // Certifications & Badges
    certifications: [{
        type: String,
        enum: ['GI Tag', 'Handloom Mark', 'Silk Mark', 'Natural Dyes', 'Organic Certified', 'KVIC', 'Fair Trade', 'Handmade India']
    }],

    // Gallery
    gallery: [{
        url: { type: String },
        caption: { type: String }
    }],

    // Video Story (optional YouTube/Vimeo embed)
    videoUrl: { type: String },

    // Stats
    productsCreated: { type: Number, default: 0 },
    familyMembers: { type: Number, default: 1 }, // How many family members involved
    generationsInCraft: { type: Number, default: 1 },

    // Impact
    impactStatement: { type: String }, // e.g., "Preserving 200-year-old weaving tradition"

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },

    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }

}, { timestamps: true });

// Indexes for efficient queries
artisanSchema.index({ state: 1, isActive: 1 });
artisanSchema.index({ craftType: 1, isActive: 1 });
artisanSchema.index({ slug: 1 });
artisanSchema.index({ isFeatured: -1, displayOrder: 1 });

export default mongoose.model("Artisan", artisanSchema);
