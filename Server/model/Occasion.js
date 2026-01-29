import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema({
  name: { type: String,  unique: true }, // Birthday
  slug: { type: String, unique: true },
  image: {
    url: { type: String, required: true },
    altText: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Occasion", occasionSchema);
