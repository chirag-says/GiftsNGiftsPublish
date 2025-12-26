import jwt from 'jsonwebtoken';
import Admin from '../model/adminModel.js';

/**
 * Legacy Auth Middleware - DEPRECATED
 * 
 * SECURITY: This middleware used headers which is insecure.
 * Redirecting to the secure adminAuth pattern.
 * 
 * NOTE: This file exists for backwards compatibility.
 * New code should use authAdmin.js instead.
 */
const authMiddleware = async (req, res, next) => {
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

    // Verify admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin not found."
      });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }
    res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

export default authMiddleware;
