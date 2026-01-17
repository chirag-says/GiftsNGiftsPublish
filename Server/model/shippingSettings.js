import mongoose from "mongoose";

const shippingSettingsSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
    unique: true
  },
  defaultShippingRate: {
    type: Number,
    default: 0
  },
  expressShippingRate: {
    type: Number,
    default: 100
  },
  freeShippingThreshold: {
    type: Number,
    default: 500
  },
  processingTime: {
    type: String,
    default: "1-2"
  },
  deliveryPartners: [{
    name: String,
    isActive: Boolean,
    priority: Number,
    deliveryTime: String,
    baseRate: Number,
    logo: String
  }],
  shippingZones: [{
    zoneName: String,
    states: [String],
    rate: Number,
    deliveryDays: Number
  }],
  packageDimensions: [{
    name: String,
    length: Number,
    width: Number,
    height: Number,
    maxWeight: Number,
    isDefault: Boolean
  }],
  pickupAddress: {
    name: String,
    phone: String,
    email: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  returnAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    city: String,
    state: String,
    pincode: String,
    sameAsPickup: { type: Boolean, default: true }
  },
  defaultPickupTime: {
    type: String,
    default: "10:00"
  },
  workingDays: [String],
  pickupSchedule: [{
    day: String,
    timeSlot: String,
    isActive: Boolean
  }],
  codSettings: {
    enabled: { type: Boolean, default: true },
    minOrderValue: { type: Number, default: 0 },
    maxOrderValue: { type: Number, default: 10000 },
    extraCharge: { type: Number, default: 0 }
  },
  trackingSettings: {
    enabled: { type: Boolean, default: true },
    provider: { type: String, default: 'Shiprocket' },
    autoNotify: { type: Boolean, default: true }
  },
  bulkShipping: {
    autoGenerateLabels: { type: Boolean, default: false }
  }

}, { timestamps: true });

const ShippingSettingsModel = mongoose.models.ShippingSettings || mongoose.model("ShippingSettings", shippingSettingsSchema);
export default ShippingSettingsModel;
