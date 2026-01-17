import express from "express";
import {
  checkout,
  paymentVerification,
  getRazorpayKey,
  razorpayWebhook
} from "../controller/paymentController.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Protected routes (require user authentication)
router.post("/checkout", userAuth, checkout);
router.get("/getkey", getRazorpayKey);

// Payment verification (callback from Razorpay)
router.post("/paymentVerification", paymentVerification);

// Webhook endpoint (server-to-server, secured by signature verification)
// NOTE: No userAuth here - webhooks come from Razorpay servers
// Security is handled via HMAC signature verification in the controller
router.post("/webhook/razorpay", razorpayWebhook);

export default router;
