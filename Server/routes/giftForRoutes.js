/**
 * Gift For Routes (Public)
 * API endpoints for "Gift For" / "Shop by Relation" feature
 * Products filtered by recipient relationship
 */
import express from 'express';
import Product from '../model/addproduct.js';
import GiftFor from '../model/GiftFor.js';

const router = express.Router();

// ============================================
// GET ALL RELATIONSHIPS (Public)
// Fetches from MongoDB, grouped by category
// ============================================
router.get('/gift-for', async (req, res) => {
    try {
        const { featured, category } = req.query;

        let query = { isActive: true };
        if (featured === 'true') query.isFeatured = true;
        if (category) query.category = category;

        const relations = await GiftFor.find(query).sort({ displayOrder: 1, name: 1 });

        // Group by category
        const grouped = {
            family: [],
            romantic: [],
            friends: [],
            professional: [],
            'age-gender': [],
            special: []
        };

        for (const rel of relations) {
            // Get product count
            const productCount = await Product.countDocuments({
                approved: true,
                isAvailable: true,
                giftFor: new RegExp(`^${rel.name}$`, 'i')
            });

            const relationData = {
                _id: rel._id,
                name: rel.name,
                slug: rel.slug,
                emoji: rel.emoji,
                description: rel.description,
                image: rel.image,
                productCount,
                isFeatured: rel.isFeatured
            };

            if (grouped[rel.category]) {
                grouped[rel.category].push(relationData);
            } else {
                grouped.family.push(relationData);
            }
        }

        res.json({
            success: true,
            data: grouped,
            all: relations.map(r => ({
                _id: r._id,
                name: r.name,
                slug: r.slug,
                emoji: r.emoji,
                description: r.description,
                image: r.image,
                category: r.category,
                isFeatured: r.isFeatured
            })),
            total: relations.length
        });
    } catch (error) {
        console.error('Error fetching gift-for relations:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch relations' });
    }
});

// ============================================
// GET RELATIONSHIP DETAILS & PRODUCTS (Public)
// ============================================
router.get('/gift-for/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            sort = 'popular',
            page = 1,
            limit = 24
        } = req.query;

        // Find relationship from database
        let relationship = await GiftFor.findOne({ slug, isActive: true });

        // Fallback for unknown slugs
        if (!relationship) {
            const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            relationship = {
                name: name,
                slug: slug,
                emoji: '🎁',
                description: `Find the perfect gift for ${name}`
            };
        }

        // Build query
        let query = {
            approved: true,
            isAvailable: true,
            giftFor: new RegExp(`^${relationship.name}$`, 'i')
        };

        // Only add price filter if explicitly provided
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

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
                relationship: {
                    _id: relationship._id,
                    name: relationship.name,
                    slug: relationship.slug,
                    emoji: relationship.emoji,
                    description: relationship.description,
                    image: relationship.image
                },
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

// ============================================
// GET SINGLE RELATIONSHIP DETAILS (Public)
// ============================================
router.get('/gift-for/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const relationship = await GiftFor.findOne({ slug, isActive: true });

        if (!relationship) {
            return res.status(404).json({
                success: false,
                message: 'Relationship not found'
            });
        }

        // Get product count
        const productCount = await Product.countDocuments({
            approved: true,
            isAvailable: true,
            giftFor: new RegExp(`^${relationship.name}$`, 'i')
        });

        res.json({
            success: true,
            data: {
                ...relationship.toObject(),
                productCount
            }
        });
    } catch (error) {
        console.error('Error fetching relationship details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch relationship details' });
    }
});

export default router;
