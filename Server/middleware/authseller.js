import jwt from "jsonwebtoken";
import "dotenv/config";
import sellermodel from "../model/sellermodel.js";

/**
 * Seller Authentication Middleware
 * SECURITY: Validates JWT and checks seller account status
 */
const authseller = async (req, res, next) => {
  try {
    const token = req.headers.stoken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Login again" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Fetch seller and check status
    const seller = await sellermodel.findById(decode.id).select('status verified approved isBlocked');

    if (!seller) {
      return res.status(401).json({ success: false, message: "Seller not found. Please register." });
    }

    // Check if seller is blocked
    if (seller.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Contact support for assistance."
      });
    }

    // Check if seller is suspended
    if (seller.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support for assistance."
      });
    }

    // Check if seller email is verified
    if (!seller.verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        requiresVerification: true
      });
    }

    req.sellerId = decode.id;
    req.seller = seller; // Attach seller object for convenience
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Session expired. Please login again" });
    }
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token. Please login again" });
    }
    console.error("Auth Middleware Error:", e);
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authseller;
