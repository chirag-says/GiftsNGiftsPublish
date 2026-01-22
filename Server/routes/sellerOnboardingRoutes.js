/**
 * Seller Onboarding Routes
 * All routes for KYC, document upload, verification, and onboarding
 */

import express from "express";
import authseller from "../middleware/authseller.js";
import upload from "../middleware/multer.js";
import {
    // Onboarding Status
    getOnboardingStatus,
    updateOnboardingStep,
    completeOnboarding,
    getCompleteOnboardingData,

    // Business Info
    updateBusinessInfo,
    getBusinessInfo,

    // Document Uploads
    uploadKycDocument,
    uploadTaxDocument,
    uploadDocument,
    getDocumentsStatus,

    // Bank Details
    updateBankDetails,
    uploadCancelledCheque,
    getBankDetails,

    // Declarations
    acceptDeclarations,
    getDeclarations,

    // Partner/Director Details
    addPartnerDetails,
    addDirectorDetails,
    removePartnerOrDirector,

    // Warehouse
    addWarehouse,
    getWarehouses,
    removeWarehouse,

    // Brand Authorization
    addBrandAuthorization,
    uploadBrandDocument,

    // Regulated Licenses
    updateRegulatedLicense,
    uploadRegulatedLicenseDocument,
    getRegulatedLicenses,
    getSellerAllDocuments,
} from "../controller/sellerOnboardingController.js";

const sellerOnboardingRouter = express.Router();

// ========================= ONBOARDING STATUS =========================
sellerOnboardingRouter.get("/status", authseller, getOnboardingStatus);
sellerOnboardingRouter.put("/step", authseller, updateOnboardingStep);
sellerOnboardingRouter.post("/complete", authseller, completeOnboarding);
sellerOnboardingRouter.get("/complete-data", authseller, getCompleteOnboardingData);

// ========================= BUSINESS INFO =========================
sellerOnboardingRouter.get("/business-info", authseller, getBusinessInfo);
sellerOnboardingRouter.put("/business-info", authseller, updateBusinessInfo);

// ========================= DOCUMENT UPLOADS =========================
sellerOnboardingRouter.get("/documents", authseller, getDocumentsStatus);
sellerOnboardingRouter.post("/documents/kyc", authseller, upload.single("document"), uploadKycDocument);
sellerOnboardingRouter.post("/documents/tax", authseller, upload.single("document"), uploadTaxDocument);
sellerOnboardingRouter.post("/documents/general", authseller, upload.single("document"), uploadDocument);

// ========================= BANK DETAILS =========================
sellerOnboardingRouter.get("/bank-details", authseller, getBankDetails);
sellerOnboardingRouter.put("/bank-details", authseller, updateBankDetails);
sellerOnboardingRouter.post("/bank-details/cancelled-cheque", authseller, upload.single("cheque"), uploadCancelledCheque);

// ========================= DECLARATIONS =========================
sellerOnboardingRouter.get("/declarations", authseller, getDeclarations);
sellerOnboardingRouter.post("/declarations", authseller, acceptDeclarations);

// ========================= PARTNER/DIRECTOR DETAILS =========================
sellerOnboardingRouter.post("/partners", authseller, addPartnerDetails);
sellerOnboardingRouter.post("/directors", authseller, addDirectorDetails);
sellerOnboardingRouter.delete("/partners-directors/:type/:index", authseller, removePartnerOrDirector);

// ========================= WAREHOUSE =========================
sellerOnboardingRouter.get("/warehouses", authseller, getWarehouses);
sellerOnboardingRouter.post("/warehouses", authseller, addWarehouse);
sellerOnboardingRouter.delete("/warehouses/:index", authseller, removeWarehouse);

// ========================= BRAND AUTHORIZATION =========================
sellerOnboardingRouter.post("/brands", authseller, addBrandAuthorization);
sellerOnboardingRouter.post("/brands/document", authseller, upload.single("document"), uploadBrandDocument);

// ========================= REGULATED LICENSES =========================
sellerOnboardingRouter.get("/licenses", authseller, getRegulatedLicenses);
sellerOnboardingRouter.put("/licenses", authseller, updateRegulatedLicense);
sellerOnboardingRouter.post("/licenses/document", authseller, upload.single("document"), uploadRegulatedLicenseDocument);
sellerOnboardingRouter.get(
  "/documents/all",
  authseller,
  getSellerAllDocuments
);
export default sellerOnboardingRouter;

