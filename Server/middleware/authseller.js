import jwt from "jsonwebtoken";
import "dotenv/config";
import sellermodel from "../model/sellermodel.js";

/**
 * Seller Authentication Middleware
 * SECURITY: Reads JWT EXCLUSIVELY from HttpOnly cookie
 * No header/localStorage fallback - pure cookie-based auth
 */
const authseller = async (req, res, next) => {
  try {
    // SECURITY: ONLY read from HttpOnly cookie - no other source
    const token = req.cookies?.stoken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login required. Please sign in."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: Fetch seller and check status
    const seller = await sellermodel.findById(decoded.id)
      .select('name email status verified approved isBlocked uniqueId region');

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Seller not found. Please register."
      });
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

    // Attach seller info to request
    req.sellerId = decoded.id;
    req.seller = seller;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again."
      });
    }
    console.error("Seller Auth Middleware Error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed."
    });
  }
};

export default authseller;


