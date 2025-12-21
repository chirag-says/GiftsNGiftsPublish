import jwt from "jsonwebtoken";
import usermodel from "../model/mongobd_usermodel.js";

/**
 * User Authentication Middleware
 * SECURITY: Reads JWT exclusively from HttpOnly cookie
 * No localStorage/header fallback - pure cookie-based auth
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        // Fetch user to check if still exists and not blocked
        const user = await usermodel.findById(decoded.id).select('isBlocked');

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

        // Attach user ID to request
        req.body.userId = decoded.id;
        req.userId = decoded.id; // Also attach directly to req for convenience
        req.user = { id: decoded.id }; // Standard express user object for compatibility

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please login again.'
            });
        }
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

export default userAuth;

