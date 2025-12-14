import mongoose from "mongoose";

const sellerschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickName: { type: String, required: true },

  otp: { type: String },
  otpExpire: { type: Date },
  verified: { type: Boolean, default: false },

  phone: Number,
  alternatePhone: { type: Number },

  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  image: String, // This serves as Owner Passport Photo
  date: { type: Date, default: Date.now },
  approved: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['Pending', 'Active', 'Suspended'],
    default: 'Pending'
  },
  commissionRate: { type: Number, default: 5 },

  // ==================== BUSINESS VERIFICATION ====================
  businessInfo: {
    ownerName: { type: String, default: '' },
    businessName: { type: String, default: '' },
    businessType: {
      type: String,
      enum: ['Individual', 'Partnership', 'LLP', 'Private Limited', 'Public Limited'],
      default: 'Individual'
    },
    registrationNumber: { type: String, default: '' },

    // Business Address (Required)
    businessAddress: { type: String, default: '' },
    businessCity: { type: String, default: '' },
    businessState: { type: String, default: '' },
    businessPincode: { type: String, default: '' },
    businessCountry: { type: String, default: 'India' },

    // PAN Details
    panNumber: { type: String, default: '' }, // Required - Main PAN
    personalPanNumber: { type: String, default: '' }, // Optional
    businessPanNumber: { type: String, default: '' }, // Optional

    // GST (Optional)
    gstNumber: { type: String, default: '' },
  },

  // ==================== GST BREAKDOWN (5 Fields) ====================
  gstDetails: {
    gstPenalty: { type: Number, default: 0 },
    gstPayout: { type: Number, default: 0 },
    gstPendingPayout: { type: Number, default: 0 },
    gstTotalWithdrawCredited: { type: Number, default: 0 },
    gstBreakpointDebit: { type: Number, default: 0 },
  },

  // ==================== BANK DETAILS ====================
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    branchName: { type: String, default: '' },
    upiId: { type: String, default: '' },
    cancelledChequeUrl: { type: String, default: '' }, // New: Cancel Cheque Image
    isBankVerified: { type: Boolean, default: false },
  },

  // ==================== DOCUMENT VERIFICATION ====================
  documents: {
    // Identity Proof - Required
    identityProof: {
      url: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'pending_review', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date }
    },
    // Business Logo - Required
    businessLogo: {
      url: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'pending_review', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date }
    },
    // Trade License - Required
    tradeLicense: {
      url: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'pending_review', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date }
    },
    // GST Certificate - Optional
    gstCertificate: {
      url: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'pending_review', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date }
    },
    // Address Proof - Required
    addressProof: {
      url: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'pending_review', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date }
    },

    // Legacy fields for backward compatibility
    gst: { type: String, default: '' },
    pan: { type: String, default: '' },
    isVerified: { type: Boolean, default: false }
  },

  // ==================== VERIFICATION STATUS ====================
  verificationStatus: {
    isFullyVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
    completionPercentage: { type: Number, default: 0 }
  }
});

const sellermodel = mongoose.models.seller || mongoose.model("Seller", sellerschema);

export default sellermodel;