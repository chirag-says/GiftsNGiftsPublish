/**
 * ⚠️ DEPRECATED - DO NOT USE ⚠️
 * 
 * =============================================================================
 * SECURITY VULNERABILITY: INSECURE AUTHENTICATION
 * =============================================================================
 * 
 * This file is DEPRECATED and MUST NOT be used in production.
 * 
 * REASON FOR DEPRECATION:
 * - Originally checked Authorization headers which is INSECURE for browser apps
 * - Headers can be read by JavaScript and are vulnerable to XSS token theft
 * - HttpOnly cookies are the secure standard for web authentication
 * 
 * SECURE ALTERNATIVES:
 * - For Admin routes: Use '../middleware/authAdmin.js'
 * - For Seller routes: Use '../middleware/authseller.js'  
 * - For User routes: Use '../middleware/userAuth.js'
 * 
 * These secure middlewares:
 * 1. Read tokens ONLY from HttpOnly cookies (not accessible via JavaScript)
 * 2. Check the token blacklist for revoked sessions
 * 3. Properly validate JWT signatures and expiry
 * 
 * ACTION REQUIRED:
 * - Update any imports of this file to use the appropriate secure middleware
 * - After confirming no code uses this file, DELETE IT
 * 
 * =============================================================================
 */

// SECURITY: This middleware throws an error if invoked
// This ensures any forgotten imports will fail loudly during testing
const authMiddleware = async (req, res, next) => {
  console.error('🔴 SECURITY ALERT: Deprecated authMiddleware was invoked!');
  console.error('🔴 Request path:', req.method, req.originalUrl);
  console.error('🔴 This middleware is INSECURE and must not be used.');
  console.error('🔴 Please update the route to use authAdmin.js, authseller.js, or userAuth.js');

  return res.status(500).json({
    success: false,
    message: "SECURITY ERROR: This authentication method is deprecated and disabled.",
    action: "Please contact the development team. Reference: DEPRECATED_AUTH_MIDDLEWARE"
  });
};

// Mark the export with a deprecation warning
export default authMiddleware;

// Additional named exports to catch other import patterns
export const deprecatedAuthMiddleware = authMiddleware;

/**
 * MIGRATION GUIDE:
 * 
 * BEFORE (INSECURE):
 * import authMiddleware from '../middleware/authMiddleware.js';
 * router.get('/admin/data', authMiddleware, getData);
 * 
 * AFTER (SECURE):
 * import adminAuth from '../middleware/authAdmin.js';
 * router.get('/admin/data', adminAuth, getData);
 * 
 * The secure middlewares read tokens from HttpOnly cookies set during login.
 */
