
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from './config/mongobd.js';
import connectcloudinary from "./config/cloudinary.js";
import { scheduleSellerInactivitySweep } from "./services/sellerInactivityService.js";
import authRoutes from './routes/auth_routes.js';
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
import productPerformanceRoutes from "./routes/productPerformanceRoutes.js";  // ✔ FIXED
import sellerPanelRoutes from "./routes/sellerPanelRoutes.js";  // New Seller Panel Routes
import giftRoutes from "./routes/giftRoutes.js";
import inventoryHubRoutes from "./routes/inventoryHubRoutes.js";
import adminShippingRoutes from "./routes/adminShippingRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import multer from 'multer'; // For error handling



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
const port = process.env.PORT || 7000;

connectDB();
connectcloudinary();
scheduleSellerInactivitySweep();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const parseEnvList = (value = '') =>
  value
    .split(',')
    .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

// CORS Configuration - Environment-aware origins
const isProduction = process.env.NODE_ENV === 'production';

const defaultAllowedOrigins = isProduction
  ? [
    // Production origins only
    'https://giftngifts.in',
    'https://www.giftngifts.in',
    'http://giftngifts.in',
    'http://www.giftngifts.in'
  ]
  : [
    // Development origins
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://giftngifts.in',
    'https://giftngifts.in'
  ];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? parseEnvList(process.env.ALLOWED_ORIGINS)
  : defaultAllowedOrigins;

const wildcardHosts = process.env.ALLOWED_HOST_SUFFIXES
  ? parseEnvList(process.env.ALLOWED_HOST_SUFFIXES)
  : ['ishisofttech.com'];

const isWildcardMatch = (hostname) =>
  wildcardHosts.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    try {
      const hostname = new URL(origin).hostname;
      if (allowedOrigins.includes(origin) || isWildcardMatch(hostname)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    } catch (error) {
      console.warn(`CORS origin parse failed for ${origin}:`, error.message);
      return callback(new Error('Invalid origin'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

console.log('CORS allowed origins:', allowedOrigins);
console.log('CORS wildcard hosts:', wildcardHosts);

app.use(cors(corsOptions));

// // Add CORS headers for static uploads to allow cross-origin image loading
// app.use('/uploads', (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// }, express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes); // ✅ New Product Routes
app.use('/api/client', clientRoutes); // ✅ New Client Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api', uploadRoutes);
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/products', productDetailsRoutes);
app.use('/api', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/reports/product-performance', productPerformanceRoutes);
app.use('/api/seller-panel', sellerPanelRoutes);  // All new seller panel routes
app.use('/api/gift-options', giftRoutes);
app.use('/api/inventory-hub', inventoryHubRoutes);
app.use('/api/admin/shipping', adminShippingRoutes);
app.use('/api/admin/support', supportRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/reports', reportsRoutes);

// ========== GLOBAL ERROR HANDLER ==========
// Handles Multer errors and other middleware errors

app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.message);

  // Handle Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Handle custom file filter errors
  if (err.message && (
    err.message.includes('Only image files') ||
    err.message.includes('Invalid file extension')
  )) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request blocked'
    });
  }

  // Generic error handler
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred. Please try again.'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
});

app.listen(port, () => console.log(`Server started on port ${port}...`));

