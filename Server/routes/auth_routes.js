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
    resendRegistrationOtp
} from "../controller/auth_controller.js";
import userAuth from "../middleware/userAuth.js";
import auth from "../middleware/cartmiddleare.js"

const router = express.Router();

// ============ AUTH ROUTES ============
router.post('/register', register);
router.post('/verify-registration-otp', verifyRegistrationOtp);  // NEW: Verify registration OTP
router.post('/resend-registration-otp', resendRegistrationOtp);  // NEW: Resend registration OTP
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendverifyotp);
router.post('/verify-Account', userAuth, verifyingEmail);
router.get('/is-auth', userAuth, isAuthenticated)
router.post('/send-reset-otp', sendResetpassword)
router.post('/reset-password', resetpassword)
router.post('/login-request-otp', loginRequestOtp);
router.post("/verify-login-otp", verifyLoginOtp);

// ============ CART ROUTES ============
router.post('/Cart', auth, Addtocart)
router.get('/Cart', auth, GetCart)
router.delete('/delete/:productId', auth, DeleteFromCart)
router.put('/update-quantity', auth, ToggleCartQuantity);
router.delete("/clear-cart", auth, clearUserCart);

// ============ WISHLIST ROUTES ============
router.post('/wishlist', auth, AddToWishlist)
router.get('/wishlist', auth, GetWishlist)
router.delete('/delete-wishlist/:productId', auth, RemoveFromWishlist)

export default router