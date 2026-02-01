/**
 * Gift For Routes
 * API endpoints for "Gift For" feature (Relationships)
 */
import express from 'express';
import Product from '../model/addproduct.js';
import mongoose from 'mongoose';

const router = express.Router();

// Defined Relationships (matching frontend constants)
const RELATIONSHIPS = [
    { name: 'Brother', slug: 'brother', emoji: '👨', description: 'Cool and thoughtful gifts for your brother' },
    { name: 'Sister', slug: 'sister', emoji: '👩', description: 'Special treasures for your lovely sister' },
    { name: 'Mother', slug: 'mother', emoji: '🤱', description: 'Heartfelt gifts to show mom you care' },
    { name: 'Father', slug: 'father', emoji: '👨‍🦳', description: 'Classic and premium picks for dad' },
    { name: 'Wife', slug: 'wife', emoji: '💍', description: 'Romantic and elegant gifts for her' },
    { name: 'Husband', slug: 'husband', emoji: '🎩', description: 'Unique finds for him' },
    { name: 'Son', slug: 'son', emoji: '👦', description: 'Gifts he will cherish forever' },
    { name: 'Daughter', slug: 'daughter', emoji: '👧', description: 'Beautiful gifts for your little princess' },
    { name: 'Friend', slug: 'friend', emoji: '🤝', description: 'Fun and meaningful gifts for friends' },
    { name: 'Colleague', slug: 'colleague', emoji: '💼', description: 'Professional yet personal office gifts' },
    { name: 'Boyfriend', slug: 'boyfriend', emoji: '💑', description: 'Something special for your guy' },
    { name: 'Girlfriend', slug: 'girlfriend', emoji: '💏', description: 'Sweet surprises for your girl' },
    { name: 'Grandparents', slug: 'grandparents', emoji: '👴', description: 'Timeless gifts for the elders' },
    { name: 'Couple', slug: 'couple', emoji: '👫', description: 'Perfect pairs for the perfect pair' },
    { name: 'In-Laws', slug: 'in-laws', emoji: '👪', description: 'Respectful and elegant gifts' }
];

// ============================================
// GET RELATIONSHIP DETAILS & PRODUCTS
// ============================================
router.get('/gift-for/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            minPrice = 0,
            maxPrice = 100000,
            sort = 'popular',
            page = 1,
            limit = 24
        } = req.query;

        // Find relationship config or create fallback
        let relationship = RELATIONSHIPS.find(r => r.slug === slug);
        if (!relationship) {
            // Fallback for dynamic/unknown slugs
            const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            relationship = {
                name: name,
                slug: slug,
                emoji: '🎁',
                description: `Find the perfect gift for ${name}`
            };
        }

        // Build query
        // Matches if 'giftFor' array contains the Relationship Name (case insensitive regex for safety)
        let query = {
            approved: true,
            isAvailable: true,
            giftFor: new RegExp(`^${relationship.name}$`, 'i')
        };

        // Price filter
        query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };

        // Sorting
        let sortOption = {};
        switch (sort) {
            case 'price-low': sortOption = { price: 1 }; break;
            case 'price-high': sortOption = { price: -1 }; break;
            case 'newest': sortOption = { createdAt: -1 }; break;
            case 'rating': sortOption = { rating: -1 }; break;
            default: sortOption = { isFeatured: -1, rating: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('categoryname', 'categoryname')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                relationship,
                products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });

    } catch (error) {
        console.error('Error fetching gift-for products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

export default router;
