// routes/productRoutes.js
import express from 'express';
import Product from '../model/addproduct.js';
import { ProductAnalytics } from "../model/reportsModel.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({ message: 'Invalid product identifier supplied.' });
    }

    // First try with populate, fall back to without if it fails
    let product;
    try {
      product = await Product.findById(cleanId)
        .populate("categoryname")
        .populate("subcategory");
    } catch (populateErr) {
      console.log("Populate failed, fetching without populate:", populateErr.message);
      product = await Product.findById(cleanId);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


export default router
