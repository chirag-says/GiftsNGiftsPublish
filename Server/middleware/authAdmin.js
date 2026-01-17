import jwt from 'jsonwebtoken';
import Admin from '../model/adminModel.js';

/**
 * Secure Cookie Configuration
 * OWASP Compliance: HttpOnly, Secure, SameSite
 */
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,                                           // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',            // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,                         // 7 days
  path: '/'
};

/**
 * Admin Authentication Middleware
 * 
 * SECURITY FEATURES:
 * 1. ONLY reads JWT from HttpOnly cookie (no header fallback)
 * 2. Explicit role verification from JWT payload
 * 3. Database validation of admin existence and status
 * 4. Rate limiting at route level (see server.js)
 * 
 * Why no header fallback:
 * If we allow Authorization header, attackers can exploit XSS to steal
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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again."
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid session. Please login again."
        });
      }
      throw jwtError;
    }

    // SECURITY: Strict role verification from JWT
    if (!decoded.role || decoded.role !== 'admin') {
      console.warn(`🛡️ Admin auth failed: Invalid role. Token role: ${decoded.role}, IP: ${req.ip}`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }

    // Verify admin exists and is not blocked
    const admin = await Admin.findById(decoded.id).select('isBlocked email name');
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

    // Attach admin info to request
    req.adminId = decoded.id;
    req.admin = admin;
    req.adminRole = decoded.role;

    next();
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed."
    });
  }
};

export default adminAuth;