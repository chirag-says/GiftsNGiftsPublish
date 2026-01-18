/**
 * Admin Verification Routes
 * Routes for seller document verification and approval
 */

import express from "express";
import authadmin from "../middleware/authAdmin.js";

import {
    getPendingVerifications,
    getSellerVerificationDetails,
    verifyDocument,
    bulkVerifyDocuments,
    verifySeller,
    partiallyVerifySeller,
    rejectSeller,
    requestAdditionalDocuments,
    getVerificationStats,
    manuallyVerifyPan,
    manuallyVerifyGst,
    manuallyVerifyBank,
} from "../controller/adminVerificationController.js";

const adminVerificationRouter = express.Router();

// ========================= VERIFICATION DASHBOARD =========================
adminVerificationRouter.get("/stats", authadmin, getVerificationStats);
adminVerificationRouter.get("/pending", authadmin, getPendingVerifications);
adminVerificationRouter.get("/seller/:sellerId", authadmin, getSellerVerificationDetails);

// ========================= DOCUMENT VERIFICATION =========================
adminVerificationRouter.post("/document", authadmin, verifyDocument);
adminVerificationRouter.post("/documents/bulk", authadmin, bulkVerifyDocuments);

// ========================= SELLER VERIFICATION =========================
adminVerificationRouter.post("/seller/:sellerId/verify", authadmin, verifySeller);
adminVerificationRouter.post("/seller/:sellerId/partial-verify", authadmin, partiallyVerifySeller);
adminVerificationRouter.post("/seller/:sellerId/reject", authadmin, rejectSeller);
adminVerificationRouter.post("/seller/:sellerId/request-documents", authadmin, requestAdditionalDocuments);

// ========================= MANUAL VERIFICATION OVERRIDES =========================
adminVerificationRouter.post("/seller/:sellerId/verify-pan", authadmin, manuallyVerifyPan);
adminVerificationRouter.post("/seller/:sellerId/verify-gst", authadmin, manuallyVerifyGst);
adminVerificationRouter.post("/seller/:sellerId/verify-bank", authadmin, manuallyVerifyBank);

export default adminVerificationRouter;
