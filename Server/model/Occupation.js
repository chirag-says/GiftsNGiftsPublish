import mongoose from "mongoose";

const occupationSchema = new mongoose.Schema({
  name: { type: String, unique: true }, // Silk Weaver
  slug: { type: String, unique: true },
  description: String,
  image: {
    url: String,
    altText: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Occupation", occupationSchema);
