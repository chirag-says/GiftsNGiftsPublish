/**
 * State Model (Shop by State)
 * Used for "Shop by State" feature - North East India focus
 * Admin can manage states with images, descriptions, highlights, etc.
 */
import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
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

  // Short description for cards
  shortDescription: {
    type: String,
    default: ''
  },

  // Full description for landing page
  description: {
    type: String,
    default: ''
  },

  // Famous products/crafts from this state
  famousFor: {
    type: String,
    default: ''
  },

  // Highlights/tags (e.g., ['Muga Silk', 'Assam Tea'])
  highlights: [{ type: String }],

  // Image for the card/banner
  image: {
    url: { type: String, default: '' },
    altText: { type: String, default: '' }
  },

  // Banner image for landing page
  bannerImage: {
    url: { type: String, default: '' },
    altText: { type: String, default: '' }
  },

  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },

  // Stats (can be auto-updated)
  productCount: { type: Number, default: 0 },
  artisanCount: { type: Number, default: 0 },

  // Display control
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },

  // Is this a Northeast state? (for filtering)
  isNorthEast: { type: Boolean, default: true }

}, { timestamps: true });

// Pre-save hook to generate slug
stateSchema.pre('save', function (next) {
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
stateSchema.index({ isNorthEast: 1, isActive: 1 });
stateSchema.index({ slug: 1 });
stateSchema.index({ displayOrder: 1 });

export default mongoose.model("State", stateSchema);
