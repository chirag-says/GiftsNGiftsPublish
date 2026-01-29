import mongoose from "mongoose";

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Assam
  slug: { type: String, unique: true },                 // assam
  image: {
    url: String,
    altText: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("State", stateSchema);
