import mongoose from "mongoose";

const addproductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  categoryname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subcategory",
    required: true,
  },

  price: { type: Number, required: true },
  oldprice: { type: Number, required: true },
  discount: { type: Number, required: true },

  ingredients: String,
  brand: String,
  size: String,
  additional_details: String,

  // ⭐ Extra Product Specification Fields
  productDimensions: { type: String },    // "30 x 10 x 3 cm"
  itemWeight: { type: String },           // "300 g"
  itemDimensionsLxWxH: { type: String },  // "30 x 10 x 3 Centimeters"
  netQuantity: { type: String, default: "1 Count" },
  genericName: { type: String },
  asin: { type: String },
  itemPartNumber: { type: String },
  dateFirstAvailable: { type: Date },
  manufacturer: { type: String },
  packer: { type: String },
  department: { type: String },
  countryOfOrigin: { type: String, default: "India" },
  bestSellerRank: { type: String },

  // ⭐ Newly Added Fields
  materialComposition: { type: String },     // "80% woolen 20% spandex"
  outerMaterial: { type: String },           // "Wool"
  length: { type: String },                  // "Calf length"
  careInstructions: { type: String },        // "Do not Iron or Bleach..."
  aboutThisItem: { type: String },           // Long description or bullet points

  approved: { type: Boolean, default: false },

  images: [
    {
      url: { type: String, required: true },
      altText: { type: String, default: "" },
    },
  ],

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },

  // ⭐ Stock Fields
  stock: { type: Number, required: true, default: 0 },

  // SECURITY: Reserved stock for pending payments (prevents overselling)
  reservedStock: { type: Number, default: 0 },

  // Track individual reservations for timeout cleanup
  reservations: [{
    razorpayOrderId: String,
    userId: String,
    quantity: Number,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],

  availability: {
    type: String,
    enum: ["In Stock", "Low Stock", "Out of Stock"],
    default: "In Stock",
  },

  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }


}, { timestamps: true });

// ⭐ Auto-update availability before saving
// SECURITY: Considers both stock and reservedStock
addproductSchema.pre("save", function (next) {
  this.stock = parseInt(this.stock) || 0;
  this.reservedStock = parseInt(this.reservedStock) || 0;

  // Available stock = total stock - reserved stock
  const availableStock = this.stock - this.reservedStock;

  this.isAvailable = availableStock > 0;

  if (availableStock <= 0) {
    if (this.stock <= 0) this.stock = 0;
    this.availability = "Out of Stock";
  }
  else if (availableStock < 5) {
    this.availability = "Low Stock";
  }
  else {
    this.availability = "In Stock";
  }

  next();
});

const addproductmodel = mongoose.model("Product", addproductSchema);
export default addproductmodel;
