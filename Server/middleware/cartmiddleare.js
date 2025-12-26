import jwt from 'jsonwebtoken';

/**
 * Cart Authentication Middleware
 * 
 * SECURITY FIX: Migrated from header-based auth to HttpOnly cookie
 * This prevents XSS attacks from stealing authentication tokens
 */
const auth = (req, res, next) => {
  // SECURITY: ONLY read from HttpOnly cookie - no header fallback
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    req.userId = decoded.id; // For compatibility with other middlewares
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session. Please login again.'
    });
  }
};

export default auth;
