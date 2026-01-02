/**
 * Client Routes
 * 
 * SECURITY HARDENED:
 * - All protected routes require userAuth middleware
 * - Input validation via Zod schemas
 * - IDOR protection in controllers
 */

import express from "express";
import {
  productlist,
  getAllProductsByCategory,
  placeorder,
  getUserOrders,
  getOrderById,
  getSearchProduct,
  validateStock,
} from "../controller/clientcontroller.js";

import userAuth from "../middleware/userAuth.js";
import {
  validate,
  validateId,
  placeOrderSchema,
  orderIdAsIdSchema,
  searchQuerySchema,
  validateStockSchema
} from "../middleware/validation.js";

const router = express.Router();

// ============ PUBLIC ROUTES (No Auth Required) ============
// Product browsing - public access
router.get("/productlist", productlist);
router.get("/productsbycategory", getAllProductsByCategory);

// Search with query validation (ReDoS protection in controller)
router.get("/search", validate(searchQuerySchema), getSearchProduct);

// ============ PROTECTED ROUTES (Auth Required) ============

/**
 * Place Order
 * SECURITY:
 * - userAuth: Verifies JWT and sets req.userId
 * - validate: Validates order structure, item limits, addresses
 * - Controller uses req.userId (never body.userId)
 */
router.post(
  "/place-order",
  userAuth,
  validate(placeOrderSchema),
  placeorder
);

/**
 * Get User's Orders
 * SECURITY:
 * - userAuth: Verifies JWT and sets req.userId
 * - Controller uses req.userId for IDOR protection
 */
router.get("/get-orders", userAuth, getUserOrders);

/**
 * Get Single Order by ID
 * SECURITY:
 * - userAuth: Verifies JWT and sets req.userId
 * - validateId: Validates ObjectId format (prevents injection)
 * - Controller verifies order belongs to authenticated user (IDOR protection)
 */
router.get(
  "/order/:id",
  userAuth,
  validateId('id'),
  getOrderById
);

/**
 * Validate Stock Availability
 * SECURITY:
 * - userAuth: Required for rate limiting abuse prevention
 * - validate: Validates items array structure
 */
router.post(
  "/validate-stock",
  userAuth,
  validate(validateStockSchema),
  validateStock
);

export default router;
