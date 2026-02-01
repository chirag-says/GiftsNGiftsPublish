/**
 * State Routes (Public)
 * API endpoints for "Shop by State" feature
 * Products filtered by origin state (North East India)
 */
import express from 'express';
import Product from '../model/addproduct.js';
import Artisan from '../model/Artisan.js';
import State from '../model/State.js';

const router = express.Router();

// ============================================
// GET ALL STATES WITH PRODUCT COUNTS (Public)
// Fetches from MongoDB, sorted by displayOrder
// ============================================
router.get('/states', async (req, res) => {
    try {
        const { featured, northeast } = req.query;

        let query = { isActive: true };
        if (featured === 'true') query.isFeatured = true;
        // Only filter by isNorthEast if northeast is explicitly 'true'
        // When northeast is 'false' or not provided, get all states
        if (northeast === 'true') query.isNorthEast = true;

        const states = await State.find(query).sort({ displayOrder: 1, name: 1 });

        const statesWithCounts = await Promise.all(
            states.map(async (state) => {
                const productCount = await Product.countDocuments({
                    approved: true,
                    isAvailable: true,
                    state: new RegExp(`^${state.name}$`, 'i')
                });

                let artisanCount = 0;
                try {
                    artisanCount = await Artisan.countDocuments({
                        isActive: true,
                        state: state.name
                    });
                } catch (e) {
                    // Artisan model may not exist
                }

                return {
                    _id: state._id,
                    name: state.name,
                    slug: state.slug,
                    description: state.description,
                    shortDescription: state.shortDescription,
                    famousFor: state.famousFor,
                    highlights: state.highlights,
                    image: state.image,
                    bannerImage: state.bannerImage,
                    productCount,
                    artisanCount,
                    isFeatured: state.isFeatured
                };
            })
        );

        res.json({
            success: true,
            data: statesWithCounts
        });
    } catch (error) {
        console.error('Error fetching states:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch states' });
    }
});

// ============================================
// GET STATE DETAILS BY SLUG (Public)
// ============================================
router.get('/states/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const state = await State.findOne({ slug, isActive: true });

        if (!state) {
            return res.status(404).json({
                success: false,
                message: 'State not found'
            });
        }

        const [productCount, artisanCount, featuredProducts, featuredArtisans] = await Promise.all([
            Product.countDocuments({
                approved: true,
                isAvailable: true,
                state: new RegExp(`^${state.name}$`, 'i')
            }),
            Artisan.countDocuments({
                isActive: true,
                state: state.name
            }).catch(() => 0),
            Product.find({
                approved: true,
                isAvailable: true,
                state: new RegExp(`^${state.name}$`, 'i'),
                isFeatured: true
            }).limit(4).select('title price images rating discount'),
            Artisan.find({
                isActive: true,
                state: state.name
            }).limit(3).select('name slug profileImage craftType').catch(() => [])
        ]);

        res.json({
            success: true,
            data: {
                _id: state._id,
                name: state.name,
                slug: state.slug,
                description: state.description,
                shortDescription: state.shortDescription,
                famousFor: state.famousFor,
                highlights: state.highlights,
                image: state.image,
                bannerImage: state.bannerImage,
                metaTitle: state.metaTitle,
                metaDescription: state.metaDescription,
                productCount,
                artisanCount,
                featuredProducts,
                featuredArtisans
            }
        });
    } catch (error) {
        console.error('Error fetching state details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch state details' });
    }
});

// ============================================
// GET PRODUCTS BY STATE (Public)
// ============================================
router.get('/states/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            craft,
            sort = 'popular',
            page = 1,
            limit = 24
        } = req.query;

        const state = await State.findOne({ slug, isActive: true });

        if (!state) {
            return res.status(404).json({
                success: false,
                message: 'State not found'
            });
        }

        let query = {
            approved: true,
            isAvailable: true,
            state: new RegExp(`^${state.name}$`, 'i')
        };

        // Only add price filter if explicitly provided
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        if (craft) {
            query.tags = new RegExp(craft, 'i');
        }

        // Sorting
        let sortOption = {};
        switch (sort) {
            case 'price-low':
                sortOption = { price: 1 };
                break;
            case 'price-high':
                sortOption = { price: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1 };
                break;
            default:
                sortOption = { isFeatured: -1, rating: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('categoryname', 'categoryname')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit))
                .select('title price oldprice discount images rating reviewCount state tags'),
            Product.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: products,
            state: {
                _id: state._id,
                name: state.name,
                slug: state.slug,
                description: state.description,
                highlights: state.highlights,
                image: state.image
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching state products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

export default router;
