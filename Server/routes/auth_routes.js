import express from "express";
import {
    register,
    login,
    logout,
    sendverifyotp,
    verifyingEmail,
    isAuthenticated,
    sendResetpassword,
    resetpassword,
    Addtocart,
    AddToWishlist,
    GetWishlist,
    GetCart,
    DeleteFromCart,
    RemoveFromWishlist,
    ToggleCartQuantity,
    loginRequestOtp,
    verifyLoginOtp,
    clearUserCart,
    // New Registration OTP Functions
    verifyRegistrationOtp,
    resendRegistrationOtp,
    // Session management
    logoutUser,
    getMe
} from "../controller/auth_controller.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// ============ AUTH ROUTES ============
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtp);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendverifyotp);
router.post('/verify-Account', userAuth, verifyingEmail);
router.get('/is-auth', userAuth, isAuthenticated);
router.post('/send-reset-otp', sendResetpassword);
router.post('/reset-password', resetpassword);
router.post('/login-request-otp', loginRequestOtp);
router.post("/verify-login-otp", verifyLoginOtp);

// ============ SESSION MANAGEMENT ============
router.get('/me', userAuth, getMe);           // NEW: Get current user (replaces localStorage check)
router.post('/logout-session', logoutUser);    // NEW: Proper logout (clears cookie)

// ============ CART ROUTES ============
router.post('/Cart', userAuth, Addtocart)
router.get('/Cart', userAuth, GetCart)
router.delete('/delete/:productId', userAuth, DeleteFromCart)
router.put('/update-quantity', userAuth, ToggleCartQuantity);
router.delete("/clear-cart", userAuth, clearUserCart);

// ============ WISHLIST ROUTES ============
router.post('/wishlist', userAuth, AddToWishlist)
router.get('/wishlist', userAuth, GetWishlist)
router.delete('/delete-wishlist/:productId', userAuth, RemoveFromWishlist)

export default router