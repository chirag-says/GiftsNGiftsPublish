import mongoose from "mongoose";

const sellerNotificationSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  category: {
    type: String,
    enum: ["inactivity", "system", "orders", "finance"],
    default: "system"
  },
  severity: {
    type: String,
    enum: ["info", "warning", "critical"],
    default: "info"
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

sellerNotificationSchema.index({ sellerId: 1, createdAt: -1 });
sellerNotificationSchema.index({ sellerId: 1, isRead: 1 });

const SellerNotification = mongoose.models.SellerNotification || mongoose.model("SellerNotification", sellerNotificationSchema);

export default SellerNotification;
