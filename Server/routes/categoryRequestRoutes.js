import express from "express";
import CategoryRequest from "../model/CategoryRequest.js";
import Category from "../model/Category.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import authseller from "../middleware/authseller.js";
import adminAuth from "../middleware/authAdmin.js";

const router = express.Router();

// Multer setup for temporary local storage
const uploadDir = path.join(process.cwd(), "uploads/category-requests");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `req_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (JPG, PNG, WebP) are allowed'));
    }
});

// ==========================================
// SELLER ROUTES
// ==========================================

/**
 * POST: Submit a category request (Seller)
 * Creates a new category request that needs admin approval
 */
router.post("/request", authseller, upload.single("image"), async (req, res) => {
    try {
        const { categoryname, reason } = req.body;
        const seller = req.seller;

        // Validation
        if (!categoryname || !categoryname.trim()) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Category image is required" });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            categoryname: { $regex: new RegExp(`^${categoryname.trim()}$`, 'i') }
        });
        if (existingCategory) {
            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "This category already exists" });
        }

        // Check if there's already a pending request for this category name
        const existingRequest = await CategoryRequest.findOne({
            categoryname: { $regex: new RegExp(`^${categoryname.trim()}$`, 'i') },
            status: 'pending'
        });
        if (existingRequest) {
            // Clean up uploaded file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: "A request for this category is already pending approval"
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "category-requests",
            resource_type: "image"
        });

        // Create the category request
        const categoryRequest = new CategoryRequest({
            categoryname: categoryname.trim(),
            image: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                altText: categoryname.trim()
            },
            seller: seller._id,
            sellerName: seller.name,
            sellerEmail: seller.email,
            reason: reason?.trim() || '',
            status: 'pending'
        });

        await categoryRequest.save();

        // Clean up local temp file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json({
            success: true,
            message: "Category request submitted successfully! It will be reviewed by admin.",
            request: categoryRequest
        });

    } catch (error) {
        console.error("Submit Category Request Error:", error);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: "Failed to submit category request" });
    }
});

/**
 * GET: Get seller's own category requests
 */
router.get("/my-requests", authseller, async (req, res) => {
    try {
        const requests = await CategoryRequest.find({ seller: req.seller._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Get My Requests Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch requests" });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * GET: Get all category requests (Admin)
 * Can filter by status: ?status=pending|approved|rejected
 */
router.get("/all", adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const requests = await CategoryRequest.find(filter)
            .populate('seller', 'name email uniqueId')
            .sort({ createdAt: -1 });

        // Get counts for each status
        const counts = {
            pending: await CategoryRequest.countDocuments({ status: 'pending' }),
            approved: await CategoryRequest.countDocuments({ status: 'approved' }),
            rejected: await CategoryRequest.countDocuments({ status: 'rejected' }),
            total: await CategoryRequest.countDocuments()
        };

        res.status(200).json({ success: true, requests, counts });
    } catch (error) {
        console.error("Get All Requests Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch category requests" });
    }
});

/**
 * PUT: Approve a category request (Admin)
 * Creates the actual category and updates request status
 */
router.put("/approve/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const request = await CategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status}`
            });
        }

        // Check if category name is still unique
        const existingCategory = await Category.findOne({
            categoryname: { $regex: new RegExp(`^${request.categoryname}$`, 'i') }
        });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "A category with this name has been created already"
            });
        }

        // Create the actual category
        const newCategory = new Category({
            categoryname: request.categoryname,
            images: [{
                url: request.image.url,
                altText: request.image.altText
            }]
        });

        await newCategory.save();

        // Update the request status
        request.status = 'approved';
        request.adminResponse = adminNote || 'Category approved and created successfully';
        request.reviewedAt = new Date();
        await request.save();

        res.status(200).json({
            success: true,
            message: `Category "${request.categoryname}" has been approved and created!`,
            category: newCategory,
            request
        });

    } catch (error) {
        console.error("Approve Category Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to approve category request" });
    }
});

/**
 * PUT: Reject a category request (Admin)
 * Optionally deletes the uploaded image from Cloudinary
 */
router.put("/reject/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await CategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status}`
            });
        }

        // Optionally delete the image from Cloudinary to save space
        if (request.image.publicId) {
            try {
                await cloudinary.uploader.destroy(request.image.publicId);
            } catch (cloudErr) {
                console.error("Failed to delete image from Cloudinary:", cloudErr);
                // Continue with rejection even if image deletion fails
            }
        }

        // Update the request status
        request.status = 'rejected';
        request.adminResponse = reason || 'Category request rejected';
        request.reviewedAt = new Date();
        await request.save();

        res.status(200).json({
            success: true,
            message: `Category request "${request.categoryname}" has been rejected`,
            request
        });

    } catch (error) {
        console.error("Reject Category Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to reject category request" });
    }
});

/**
 * DELETE: Delete a category request (Admin)
 */
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const request = await CategoryRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Delete image from Cloudinary if exists
        if (request.image.publicId) {
            try {
                await cloudinary.uploader.destroy(request.image.publicId);
            } catch (cloudErr) {
                console.error("Failed to delete image from Cloudinary:", cloudErr);
            }
        }

        await CategoryRequest.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category request deleted successfully"
        });

    } catch (error) {
        console.error("Delete Category Request Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete category request" });
    }
});

export default router;
