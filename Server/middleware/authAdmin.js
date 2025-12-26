import jwt from 'jsonwebtoken';
import Admin from '../model/adminModel.js';

/**
 * Admin Authentication Middleware
 * 
 * SECURITY FIX: Removed Authorization header fallback
 * ONLY reads JWT from HttpOnly cookie to maximize security
 * 
 * Why: If we allow header fallback, attackers can exploit XSS to steal
 * tokens from localStorage and send them via headers, bypassing HttpOnly protection.
 */
const adminAuth = async (req, res, next) => {
  try {
    // SECURITY: ONLY read from HttpOnly cookie - no header fallback
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login required. Please sign in."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify admin exists and is not blocked
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found. Please register."
      });
    }

    if (admin.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Admin account is blocked. Contact support."
      });
    }

    // Attach admin ID to request
    req.adminId = decoded.id;
    req.admin = admin;

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
    console.error("Admin Auth Middleware Error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed."
    });
  }
};

export default adminAuth;