import jwt from "jsonwebtoken";
import usermodel from "../model/mongobd_usermodel.js";

/**
 * Secure Cookie Configuration for User
 * OWASP Compliance: HttpOnly, Secure, SameSite
 */
export const USER_COOKIE_OPTIONS = {
    httpOnly: true,                                           // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production',            // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                         // 7 days
    path: '/'
};

/**
 * User Authentication Middleware
 * 
 * SECURITY FEATURES:
 * 1. ONLY reads JWT from HttpOnly cookie (no localStorage/header fallback)
 * 2. Explicit role verification from JWT payload
 * 3. Database validation of user existence and block status
 * 4. Pure cookie-based auth for XSS protection
 */
const userAuth = async (req, res, next) => {
    try {
        // SECURITY: Only read from HttpOnly cookie
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Please login.'
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
                    message: 'Session expired. Please login again.'
                });
            }
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid session. Please login again.'
                });
            }
            throw jwtError;
        }

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        // SECURITY: Strict role verification from JWT
        // Allow 'user' role or undefined role (for backward compatibility with existing tokens)
        if (decoded.role && decoded.role !== 'user') {
            console.warn(`🛡️ User auth failed: Invalid role. Token role: ${decoded.role}, IP: ${req.ip}`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. User account required.'
            });
        }

        // Fetch user to check if still exists and not blocked
        const user = await usermodel.findById(decoded.id).select('isBlocked name email');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please register.'
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account is blocked. Contact support.'
            });
        }

        // Attach user info to request
        req.body.userId = decoded.id;
        req.userId = decoded.id;
        req.user = { id: decoded.id, name: user.name, email: user.email };
        req.userRole = decoded.role || 'user';

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

export default userAuth;
