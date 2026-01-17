import express from "express";
import SubcategoryRequest from "../model/SubcategoryRequest.js";
import Subcategory from "../model/Subcategory.js";
import Category from "../model/Category.js";
import authseller from "../middleware/authseller.js";
import adminAuth from "../middleware/authAdmin.js";

const router = express.Router();

// ==========================================
// SELLER ROUTES
// ==========================================

/**
 * POST: Submit a subcategory request (Seller)
 * Creates a new subcategory request that needs admin approval
 */
router.post("/request", authseller, async (req, res) => {
    try {
        const { subcategory, categoryId, reason } = req.body;
        const seller = req.seller;

        // Validation
        if (!subcategory || !subcategory.trim()) {
            return res.status(400).json({ success: false, message: "Subcategory name is required" });
        }

        if (!categoryId) {
            return res.status(400).json({ success: false, message: "Parent category is required" });
        }

        // Check if parent category exists
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            return res.status(404).json({ success: false, message: "Parent category not found" });
        }

        // Check if subcategory already exists
        const existingSubcategory = await Subcategory.findOne({
            subcategory: { $regex: new RegExp(`^${subcategory.trim()}$`, 'i') }
        });
        if (existingSubcategory) {
            return res.status(400).json({ success: false, message: "This subcategory already exists" });
        }

        // Check if there's already a pending request for this subcategory name
        const existingRequest = await SubcategoryRequest.findOne({
            subcategory: { $regex: new RegExp(`^${subcategory.trim()}$`, 'i') },
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "A request for this subcategory is already pending approval"
            });
        }

        // Create the subcategory request
        const subcategoryRequest = new SubcategoryRequest({
            subcategory: subcategory.trim(),
            category: categoryId,
            categoryName: parentCategory.categoryname,
            seller: seller._id,
            sellerName: seller.name,
            sellerEmail: seller.email,
            reason: reason?.trim() || '',
            status: 'pending'
        });

        await subcategoryRequest.save();

        res.status(201).json({
            success: true,
            message: "Subcategory request submitted successfully! It will be reviewed by admin.",
            request: subcategoryRequest
        });

    } catch (error) {
        console.error("Submit Subcategory Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to submit subcategory request" });
    }
});

/**
 * GET: Get seller's own subcategory requests
 */
router.get("/my-requests", authseller, async (req, res) => {
    try {
        const requests = await SubcategoryRequest.find({ seller: req.seller._id })
            .populate('category', 'categoryname')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Get My Subcategory Requests Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * GET: Get all subcategory requests (Admin)
 * Can filter by status: ?status=pending|approved|rejected
 */
router.get("/all", adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const requests = await SubcategoryRequest.find(filter)
            .populate('seller', 'name email uniqueId')
            .populate('category', 'categoryname')
            .sort({ createdAt: -1 });

        // Get counts for each status
        const counts = {
            pending: await SubcategoryRequest.countDocuments({ status: 'pending' }),
            approved: await SubcategoryRequest.countDocuments({ status: 'approved' }),
            rejected: await SubcategoryRequest.countDocuments({ status: 'rejected' }),
            total: await SubcategoryRequest.countDocuments()
        };

        res.status(200).json({ success: true, requests, counts });
    } catch (error) {
        console.error("Get All Subcategory Requests Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch subcategory requests" });
    }
});

/**
 * PUT: Approve a subcategory request (Admin)
 * Creates the actual subcategory and updates request status
 */
router.put("/approve/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const request = await SubcategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status}`
            });
        }

        // Check if subcategory name is still unique
        const existingSubcategory = await Subcategory.findOne({
            subcategory: { $regex: new RegExp(`^${request.subcategory}$`, 'i') }
        });
        if (existingSubcategory) {
            return res.status(400).json({
                success: false,
                message: "A subcategory with this name has been created already"
            });
        }

        // Check if parent category still exists
        const parentCategory = await Category.findById(request.category);
        if (!parentCategory) {
            return res.status(400).json({
                success: false,
                message: "Parent category no longer exists"
            });
        }

        // Create the actual subcategory
        const newSubcategory = new Subcategory({
            subcategory: request.subcategory,
            category: request.category
        });

        await newSubcategory.save();

        // Update the request status
        request.status = 'approved';
        request.adminResponse = adminNote || 'Subcategory approved and created successfully';
        request.reviewedAt = new Date();
        await request.save();

        res.status(200).json({
            success: true,
            message: `Subcategory "${request.subcategory}" has been approved and created!`,
            subcategory: newSubcategory,
            request
        });

    } catch (error) {
        console.error("Approve Subcategory Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to approve subcategory request" });
    }
});

/**
 * PUT: Reject a subcategory request (Admin)
 */
router.put("/reject/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await SubcategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status}`
            });
        }

        // Update the request status
        request.status = 'rejected';
        request.adminResponse = reason || 'Subcategory request rejected';
        request.reviewedAt = new Date();
        await request.save();

        res.status(200).json({
            success: true,
            message: `Subcategory request "${request.subcategory}" has been rejected`,
            request
        });

    } catch (error) {
        console.error("Reject Subcategory Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to reject subcategory request" });
    }
});

/**
 * DELETE: Delete a subcategory request (Admin)
 */
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const request = await SubcategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        await SubcategoryRequest.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Subcategory request deleted successfully"
        });

    } catch (error) {
        console.error("Delete Subcategory Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete subcategory request" });
    }
});

export default router;
