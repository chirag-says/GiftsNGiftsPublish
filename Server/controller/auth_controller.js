/**
 * Authentication Controller
 * REFACTORED: Contains only authentication-related logic
 * SECURITY FIX: Using crypto.randomInt() for secure OTP generation
 * 
 * Cart logic moved to: cartController.js
 * Wishlist logic moved to: wishlistController.js
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usermodel from "../model/mongobd_usermodel.js";
import transporter from "../config/nodemailer.js";
import Profile from "../model/userprofile.js";

/**
 * SECURITY: Generate cryptographically secure 6-digit OTP
 * Uses crypto.randomInt() instead of Math.random()
 */
const generateSecureOTP = () => {
  return String(crypto.randomInt(100000, 999999));
};

/**
 * Request OTP for login
 */
export const loginRequestOtp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await usermodel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ success: false, message: "Your account is blocked. Contact support." });
    }

    // SECURITY FIX: Use cryptographically secure OTP
    const otp = generateSecureOTP();

    user.verifyotp = otp;
    user.verifyotpexpAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOption);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Verify login OTP and create session
 */
export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account is blocked. Contact support." });
    }
    if (user.verifyotp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyotpexpAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Register new user
 * TYPO FIX: hashedpasswoed -> hashedPassword
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "Missing Details",
    });
  }
  try {
    const existinguser = await usermodel.findOne({ email });

    if (existinguser) {
      return res.json({
        success: false,
        message: "User already exists ",
      });
    }

    // TYPO FIX: Renamed from hashedpasswoed to hashedPassword
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new usermodel({ name, email, password: hashedPassword });
    await user.save();

    const profile = new Profile({
      user: user._id,
      phone: "",
      addresses: [],
      name: name,
      email: email,
    });
    await profile.save();

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email in background - don't block registration
    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to GiftNGifts",
      text: `Welcome to GiftNGifts! Your account has been created successfully with email: ${email}`,
    };

    transporter.sendMail(mailOption).catch(err => {
      // Log only in development, not in production
      if (process.env.NODE_ENV !== 'production') {
        console.log("Welcome email failed:", err.message);
      }
    });

    return res.json({
      success: true,
      token,
      message: "Account created successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login user (initiates OTP flow)
 */
export const login = async (req, res) => {
  const emailInput = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const passwordInput = typeof req.body.password === "string" ? req.body.password : "";

  if (!emailInput || !passwordInput) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  if (emailInput.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid email address.",
    });
  }

  if (passwordInput.length > 128) {
    return res.status(400).json({
      success: false,
      message: "Password is too long.",
    });
  }

  try {
    const user = await usermodel.findOne({ email: emailInput });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(passwordInput, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account is blocked. Contact support.",
      });
    }

    const otp = generateSecureOTP();
    user.verifyotp = otp;
    user.verifyotpexpAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Login OTP",
      text: `Your OTP is: ${otp}`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to login.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Logout user (clear cookie)
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Send verification OTP to email
 */
export const sendverifyotp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerify) {
      return res.json({ success: false, message: "Account already verified" });
    }

    // SECURITY FIX: Use cryptographically secure OTP
    const otp = generateSecureOTP();
    user.verifyotp = otp;
    user.verifyotpexpAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Login OTP",
      text: `Your OTP is ${otp}.`,
    };

    await transporter.sendMail(mailOption);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Verify email with OTP
 */
export const verifyingEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "missing Details" });
  }
  try {
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }

    if (user.verifyotp === "" || user.verifyotp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyotpexpAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerify = true;
    user.verifyotp = "";
    user.verifyotpexpAt = 0;
    await user.save();
    res.json({ success: true, message: "Email Verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (req, res) => {
  try {
    const user = await usermodel.findById(req.body.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Send password reset OTP
 */
export const sendResetpassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({
      success: true,
      message: "Email is required",
    });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // SECURITY FIX: Use cryptographically secure OTP
    const otp = generateSecureOTP();

    user.resetotp = otp;
    user.resetotpexpireAt = Date.now() + 15 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Use this OTP to proceed with resetting your password.`,
    };
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP send to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Reset user password with OTP verification
 */
export const resetpassword = async (req, res) => {
  const { email, otp, newpassword } = req.body;
  if (!email || !otp || !newpassword) {
    return res.json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "user not found" });
    }

    if (user.resetotp == "" || user.resetotp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetotpexpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    user.password = hashedPassword;
    user.resetotp = "";
    user.resetotpexpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "password has been reset successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Verify registration OTP
 */
export const verifyRegistrationOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verifyotp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyotpexpAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerify = true;
    user.verifyotp = '';
    user.verifyotpexpAt = 0;
    await user.save();

    const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("Verify Registration OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Resend registration OTP
 */
export const resendRegistrationOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerify) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    // SECURITY FIX: Use cryptographically secure OTP
    const otp = generateSecureOTP();
    user.verifyotp = otp;
    user.verifyotpexpAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your verification OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOption);

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Resend Registration OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Logout user (session management)
 */
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get current authenticated user
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await usermodel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerify,
      }
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};