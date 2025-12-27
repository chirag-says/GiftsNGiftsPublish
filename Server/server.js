import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/mongobd.js";
import connectcloudinary from "./config/cloudinary.js";
import { scheduleSellerInactivitySweep } from "./services/sellerInactivityService.js";

// Routes
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/upload_routes.js";
import categoryRoutes from "./routes/category_routes.js";
import subcategoryRoutes from "./routes/subcategory_routes.js";
import sellerRoutes from "./routes/sellerroutes.js";
import clientRoutes from "./routes/clientroute.js";
import productDetailsRoutes from "./routes/productdetails_api.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminRoutes from "./routes/adminRoute.js";
import productPerformanceRoutes from "./routes/productPerformanceRoutes.js";
import sellerPanelRoutes from "./routes/sellerPanelRoutes.js";
import giftRoutes from "./routes/giftRoutes.js";
import inventoryHubRoutes from "./routes/inventoryHubRoutes.js";
import adminShippingRoutes from "./routes/adminShippingRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 7000;

/* =========================
   INIT SERVICES
========================= */
connectDB();
connectcloudinary();
scheduleSellerInactivitySweep();

/* =========================
   🛡️ SECURITY: HTTP HEADERS (Helmet)
   Fixes: Missing security headers, X-Frame-Options,
          Content-Security-Policy, HSTS
========================= */
app.use(
  helmet({
    // Content Security Policy - allows Cloudinary images
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com"
        ],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com"
        ],
        frameSrc: ["'self'", "https://api.razorpay.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    // X-Frame-Options: Prevent clickjacking
    frameguard: { action: "deny" },
    // HSTS: Force HTTPS (1 year)
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    // Hide X-Powered-By header
    hidePoweredBy: true,
    // X-Content-Type-Options: nosniff
    noSniff: true,
    // X-XSS-Protection (legacy browsers)
    xssFilter: true,
    // Referrer-Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // Disable to allow Cloudinary images
    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

/* =========================
   🛡️ SECURITY: RATE LIMITING
   Fixes: Protection vs. Bots, DDoS, Brute-force
========================= */

// Global API rate limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for trusted proxies in production
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === "/" || req.path === "/health";
  }
});

// Stricter limiter for auth routes (login, register, OTP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Only 20 auth attempts per 15 minutes
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Very strict limiter for password reset / OTP
const sensitiveAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 attempts per hour
  message: {
    success: false,
    message: "Too many attempts, please try again after 1 hour."
  },
  standardHeaders: true,
  legacyHeaders: false
});

/* =========================
   PARSERS
========================= */
app.use(express.json({ limit: "10mb" })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

/* =========================
   ✅ CORS CONFIG
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",

  "https://giftngifts.in",
  "https://www.giftngifts.in",

  "https://giftsngifts.in",
  "https://www.giftsngifts.in"
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow server requests, curl, postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ⚠️ Log but don't block (for debugging)
      console.warn("⚠️ CORS origin not listed:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token",
      "stoken"
    ],
    optionsSuccessStatus: 204
  })
);

// Preflight handler
app.options("*", cors());

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   🛡️ APPLY RATE LIMITERS TO ROUTES
========================= */

// Apply global rate limiter to all /api routes
app.use("/api", apiLimiter);

// Apply stricter limiter to auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/send-otp", sensitiveAuthLimiter);
app.use("/api/auth/verify-otp", sensitiveAuthLimiter);
app.use("/api/auth/reset-password", sensitiveAuthLimiter);
app.use("/api/seller/login", authLimiter);
app.use("/api/seller/register", authLimiter);
app.use("/api/admin/login", authLimiter);

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use("/api", uploadRoutes);
app.use("/api", categoryRoutes);
app.use("/api", subcategoryRoutes);

app.use("/api/seller", sellerRoutes);
app.use("/api/products", productDetailsRoutes);
app.use("/api", paymentRoutes);

app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/reports/product-performance", productPerformanceRoutes);
app.use("/api/seller-panel", sellerPanelRoutes);

app.use("/api/gift-options", giftRoutes);
app.use("/api/inventory-hub", inventoryHubRoutes);

app.use("/api/admin/shipping", adminShippingRoutes);
app.use("/api/admin/support", supportRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/reports", reportsRoutes);

app.use("/api/communication", communicationRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/* =========================
   🛡️ 404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   🛡️ GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔴 Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message
  });
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🛡️ Security: Helmet enabled`);
  console.log(`🛡️ Rate Limiting: Active on /api routes`);
});