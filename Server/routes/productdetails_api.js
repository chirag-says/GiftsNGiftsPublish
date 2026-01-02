// routes/productRoutes.js
import express from 'express';
import Product from '../model/addproduct.js';
import { ProductAnalytics } from "../model/reportsModel.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.trim(); // remove any spaces/newlines
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({ message: 'Invalid product identifier supplied.' });
    }
    const product = await Product.findById(cleanId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // TRACK VIEW
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await ProductAnalytics.findOneAndUpdate(
        { productId: cleanId, date: today },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
    } catch (analyticsError) {
      console.error("Failed to track product view:", analyticsError);
      // Don't fail the request if analytics fails
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router
