import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
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
    // Content Security Policy - HARDENED
    // SECURITY: Removed 'unsafe-inline' and 'unsafe-eval'
    // For frontend compatibility, use nonce-based scripts or specific hashes
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Scripts: Only allow self and specific trusted domains
        // In development, we allow unsafe-inline. In production, use nonces.
        scriptSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"]
          : ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
        // Styles: Allow Google Fonts, self. Inline styles need nonce in production.
        styleSrc: process.env.NODE_ENV === 'production'
          ? ["'self'", "https://fonts.googleapis.com"]
          : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
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
          "https://lumberjack.razorpay.com",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com"
        ],
        frameSrc: ["'self'", "https://api.razorpay.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"], // Clickjacking protection
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
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

// Global API rate limiter
// Development: More lenient for testing
// Production: Stricter for security
const isDev = process.env.NODE_ENV !== 'production';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 100, // 500 in dev, 100 in production
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    if (isDev) return true;
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
   PARSERS - Route-Specific Payload Limits
   SECURITY: Differentiated limits to prevent payload-based DoS
========================= */

// Default parser with conservative limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// SECURITY: Stricter limits for sensitive routes (applied BEFORE routes)
// 20KB limit for auth/user routes (no need for large payloads)
const strictPayloadLimit = express.json({ limit: "20kb" });
app.use("/api/auth", strictPayloadLimit);
app.use("/api/user", strictPayloadLimit);

/* =========================
   🛡️ SECURITY: NoSQL Injection Prevention
   Sanitizes user inputs to prevent MongoDB operator injection attacks
   e.g., prevents { "$gt": "" } in req.body, req.query, req.params
========================= */
app.use(mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    console.warn(`🛡️ NoSQL Injection attempt blocked. Key: ${key}, IP: ${req.ip}`);
  }
}));

/* =========================
   ✅ CORS CONFIG - PRODUCTION HARDENED
   
   SECURITY: Strict origin whitelisting
   - Production: ONLY whitelisted domains allowed
   - Development: Allow localhost for development flexibility
========================= */
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  // Development origins (only used in non-production)
  ...(isProduction ? [] : [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ]),
  // Production origins - ALWAYS allowed
  "https://giftngifts.in",
  "https://www.giftngifts.in",
  "https://giftsngifts.in",
  "https://www.giftsngifts.in",
  // Add admin/seller subdomains if needed
  "https://admin.giftsngifts.in",
  "https://seller.giftsngifts.in"
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // SECURITY: In production, BLOCK non-whitelisted origins
      if (isProduction) {
        console.warn(`🛡️ CORS BLOCKED: Unauthorized origin attempt from ${origin}`);
        return callback(new Error('CORS policy: Origin not allowed'), false);
      }

      // Development only: Allow with warning
      console.warn(`⚠️ CORS origin not whitelisted (dev mode): ${origin}`);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin"
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // Cache preflight for 10 minutes
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
   
   SECURITY: Error Information Disclosure Prevention
   - Production: Generic messages only (no stack traces, no internal details)
   - Development: Full error details for debugging
   - All errors logged internally with full context
========================= */
app.use((err, req, res, next) => {
  // Generate unique error ID for correlation
  const errorId = `ERR_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

  // INTERNAL LOGGING: Full details for debugging (secure logs only)
  console.error('='.repeat(60));
  console.error(`🔴 ERROR ID: ${errorId}`);
  console.error(`🔴 Timestamp: ${new Date().toISOString()}`);
  console.error(`🔴 Path: ${req.method} ${req.originalUrl}`);
  console.error(`🔴 IP: ${req.ip}`);
  console.error(`🔴 User-Agent: ${req.get('User-Agent')}`);
  console.error(`🔴 Error Name: ${err.name}`);
  console.error(`🔴 Error Message: ${err.message}`);
  console.error(`🔴 Stack Trace:`);
  console.error(err.stack);
  console.error('='.repeat(60));

  // Determine HTTP status code
  const statusCode = err.status || err.statusCode || 500;

  // SECURITY: Client response - hide sensitive details in production
  const clientResponse = {
    success: false,
    errorId // Allow users to report this ID for support
  };

  if (process.env.NODE_ENV === 'production') {
    // Production: Generic error messages only
    if (statusCode >= 500) {
      clientResponse.message = 'An internal server error occurred. Please try again later.';
    } else if (statusCode === 401) {
      clientResponse.message = 'Authentication required. Please login.';
    } else if (statusCode === 403) {
      clientResponse.message = 'Access denied.';
    } else if (statusCode === 404) {
      clientResponse.message = 'Resource not found.';
    } else if (statusCode === 429) {
      clientResponse.message = 'Too many requests. Please try again later.';
    } else {
      clientResponse.message = 'Request could not be processed.';
    }
  } else {
    // Development: Include error details for debugging
    clientResponse.message = err.message;
    clientResponse.error = err.name;
    // Don't include full stack trace even in dev for security
  }

  res.status(statusCode).json(clientResponse);
});

/* =========================
   START SERVER
========================= */
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🛡️ Security: Helmet enabled`);
  console.log(`🛡️ Rate Limiting: Active on /api routes`);
});