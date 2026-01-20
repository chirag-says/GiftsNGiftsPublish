// routes/sellerProfileRoutes.js
import express from "express";
import authseller from "../middleware/authseller.js";
import { getBasicSellerProfile, getSellerBusinessDetails, updateBasicSellerProfile, updateSellerBusinessDetails } from "../controller/sellerOnboardingController.js";


const router = express.Router();

router.get("/profile/basic", authseller, getBasicSellerProfile);
router.get("/profile/business-details",
  authseller,
  getSellerBusinessDetails
);
router.put(
  "/profile/basic",
  authseller,
  updateBasicSellerProfile
);
router.put(
  "/profile/business-details",
  authseller,
  updateSellerBusinessDetails
);

export default router;
