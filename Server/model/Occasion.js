import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
  name: { type: String, unique: true }, // e.g., "Diwali", "Birthday"
  slug: { type: String, unique: true }, // e.g., "diwali", "birthday"

  // Category for grouping occasions
  category: {
    type: String,
    enum: ['corporate', 'personal', 'seasonal'],
    default: 'personal'
  },

  description: { type: String, default: '' },
  emoji: { type: String, default: '🎁' },

  image: {
    url: { type: String, default: '' },
    altText: String
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

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Index for faster queries
occasionSchema.index({ category: 1, isActive: 1 });
occasionSchema.index({ slug: 1 });

export default mongoose.model("Occasion", occasionSchema);

