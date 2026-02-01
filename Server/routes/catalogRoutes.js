/**
 * Catalog Management Routes (Admin)
 * Routes for managing:
 * - Categories & Subcategories
 * - Occasions (Shop by Occasion)
 * - States (Shop by State)
 * - GiftFor Relations (Shop by Relation)
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import adminAuth from '../middleware/authAdmin.js';
import {
    // Occasions
    getAllOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion,
    seedOccasions,

    // States
    getAllStates,
    createState,
    updateState,
    deleteState,
    seedStates,

    // GiftFor
    getAllGiftFor,
    createGiftFor,
    updateGiftFor,
    deleteGiftFor,
    seedGiftFor,

    // Subcategories
    getAllSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,

    // Utils
    updateProductCounts
} from '../controller/catalogController.js';

const router = express.Router();

// Multer setup for image uploads
const uploadDir = path.join(process.cwd(), 'uploads/catalog');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// ============================================
// OCCASION ROUTES
// ============================================
router.get('/occasions', adminAuth, getAllOccasions);
router.post('/occasions', adminAuth, upload.single('image'), createOccasion);
router.put('/occasions/:id', adminAuth, upload.single('image'), updateOccasion);
router.delete('/occasions/:id', adminAuth, deleteOccasion);
router.post('/occasions/seed', adminAuth, seedOccasions);

// ============================================
// STATE ROUTES
// ============================================
router.get('/states', adminAuth, getAllStates);
router.post('/states', adminAuth, upload.single('image'), createState);
router.put('/states/:id', adminAuth, upload.single('image'), updateState);
router.delete('/states/:id', adminAuth, deleteState);
router.post('/states/seed', adminAuth, seedStates);

// ============================================
// GIFT FOR (RELATION) ROUTES
// ============================================
router.get('/gift-for', adminAuth, getAllGiftFor);
router.post('/gift-for', adminAuth, upload.single('image'), createGiftFor);
router.put('/gift-for/:id', adminAuth, upload.single('image'), updateGiftFor);
router.delete('/gift-for/:id', adminAuth, deleteGiftFor);
router.post('/gift-for/seed', adminAuth, seedGiftFor);

// ============================================
// SUBCATEGORY ROUTES (Enhanced)
// ============================================
router.get('/subcategories', adminAuth, getAllSubcategories);
router.post('/subcategories', adminAuth, upload.single('image'), createSubcategory);
router.put('/subcategories/:id', adminAuth, upload.single('image'), updateSubcategory);
router.delete('/subcategories/:id', adminAuth, deleteSubcategory);

// ============================================
// UTILITY ROUTES
// ============================================
router.post('/update-product-counts', adminAuth, updateProductCounts);

export default router;
