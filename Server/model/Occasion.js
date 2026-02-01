/**
 * Occasion Model (Shop by Occasion)
 * Used for "Shop by Occasion" feature
 * Admin can manage occasions with images, categories, SEO, etc.
 */
import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
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

  // Category for grouping occasions
  category: {
    type: String,
    enum: ['corporate', 'personal', 'seasonal', 'festival', 'cultural'],
    default: 'personal'
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

  emoji: {
    type: String,
    default: '🎁'
  },

  // Main image for cards
  image: {
    url: { type: String, default: '' },
    altText: { type: String, default: '' }
  },

  // Banner image for landing page
  bannerImage: {
    url: { type: String, default: '' },
    altText: { type: String, default: '' }
  },

  // B2B specific fields
  minBudget: { type: Number, default: 0 },
  maxBudget: { type: Number, default: 100000 },
  popularFor: [{ type: String }], // e.g., ['Clients', 'Employees', 'Partners']

  // SEO and display
  metaTitle: { type: String },
  metaDescription: { type: String },

  // Stats
  productCount: { type: Number, default: 0 },

  // Display control
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }

}, { timestamps: true });

// Pre-save hook to generate slug
occasionSchema.pre('save', function (next) {
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

// Index for faster queries
occasionSchema.index({ category: 1, isActive: 1 });
occasionSchema.index({ slug: 1 });
occasionSchema.index({ displayOrder: 1 });

export default mongoose.model("Occasion", occasionSchema);
