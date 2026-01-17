import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  title: {
    type: String
  },
  // Verified purchase - user actually bought this product
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    default: null
  },
  // Review helpful votes
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  // Seller response
  sellerResponse: {
    type: String,
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  },
  isHidden: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Reported'],
    default: 'Approved'  // Auto-approve for now
  },
  reportReason: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }

}, { timestamps: true });

// Index for faster queries
reviewSchema.index({ productId: 1, userId: 1 });
reviewSchema.index({ productId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
