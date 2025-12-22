import express from "express";
import {
  checkout,
  paymentVerification,
  getRazorpayKey
} from "../controller/paymentController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.post("/checkout", userAuth, checkout);
router.post("/paymentVerification", paymentVerification);
router.get("/getkey", getRazorpayKey);

export default router;
