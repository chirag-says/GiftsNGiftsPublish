/**
 * State Routes
 * API endpoints for "Shop by State" feature
 * Products filtered by origin state (North East India)
 */
import express from 'express';
import Product from '../model/addproduct.js';
import Artisan from '../model/Artisan.js';

const router = express.Router();

// ============================================
// STATE DEFINITIONS
// ============================================
const STATES = [
    {
        name: 'Assam',
        slug: 'assam',
        products: 'Tea, Silk, Cane',
        description: 'Home of Muga silk and world-famous Assam tea',
        highlights: ['Muga Silk', 'Assam Tea', 'Bamboo Crafts', 'Bell Metal']
    },
    {
        name: 'Meghalaya',
        slug: 'meghalaya',
        products: 'Organic Honey, Pottery',
        description: 'Land of clouds with pristine organic products',
        highlights: ['Organic Honey', 'Cane & Bamboo', 'Orange Blossom', 'Khasi Textiles']
    },
    {
        name: 'Nagaland',
        slug: 'nagaland',
        products: 'Textiles, Jewelry',
        description: 'Rich tribal heritage with distinctive shawls and ornaments',
        highlights: ['Naga Shawls', 'Tribal Jewelry', 'Wood Carvings', 'Bamboo Crafts']
    },
    {
        name: 'Manipur',
        slug: 'manipur',
        products: 'Handloom, Bamboo Weave',
        description: 'Elegant handloom traditions and unique Longpi pottery',
        highlights: ['Longpi Pottery', 'Moirang Phee', 'Kouna Craft', 'Wood Lacquer']
    },
    {
        name: 'Mizoram',
        slug: 'mizoram',
        products: 'Traditional Fabrics, Music Crafts',
        description: 'Traditional Mizo fabrics and handcrafted instruments',
        highlights: ['Puan Textiles', 'Bamboo Products', 'Cane Furniture', 'Traditional Attire']
    },
    {
        name: 'Arunachal Pradesh',
        slug: 'arunachal-pradesh',
        products: 'Organic Produce, Handcrafted Decor',
        description: 'Land of the rising sun with diverse tribal crafts',
        highlights: ['Monpa Carpets', 'Yak Products', 'Tribal Textiles', 'Organic Kiwi']
    },
    {
        name: 'Tripura',
        slug: 'tripura',
        products: 'Bamboo Crafts, Handloom',
        description: 'Exquisite bamboo work and tribal handloom',
        highlights: ['Tripura Handloom', 'Bamboo Dolls', 'Risa Textile', 'Wood Carvings']
    },
    {
        name: 'Sikkim',
        slug: 'sikkim',
        products: 'Organic Products, Handicrafts',
        description: 'Fully organic state with Himalayan treasures',
        highlights: ['Organic Tea', 'Thangka Paintings', 'Choktse Tables', 'Large Cardamom']
    }
];

// ============================================
// GET ALL STATES WITH PRODUCT COUNTS
// ============================================
router.get('/states', async (req, res) => {
    try {
        const statesWithCounts = await Promise.all(
            STATES.map(async (state) => {
                const productCount = await Product.countDocuments({
                    approved: true,
                    isAvailable: true,
                    state: new RegExp(`^${state.name}$`, 'i')
                });

                const artisanCount = await Artisan.countDocuments({
                    isActive: true,
                    state: state.name
                });

                return {
                    ...state,
                    productCount,
                    artisanCount
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
// GET STATE DETAILS
// ============================================
router.get('/states/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const state = STATES.find(s => s.slug === slug);

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
            }),
            Product.find({
                approved: true,
                isAvailable: true,
                state: new RegExp(`^${state.name}$`, 'i'),
                isFeatured: true
            }).limit(4).select('title price images rating'),
            Artisan.find({
                isActive: true,
                state: state.name
            }).limit(3).select('name slug profileImage craftType')
        ]);

        res.json({
            success: true,
            data: {
                ...state,
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
// GET PRODUCTS BY STATE
// ============================================
router.get('/states/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            minPrice = 0,
            maxPrice = 100000,
            craft,
            sort = 'popular',
            page = 1,
            limit = 24
        } = req.query;

        const state = STATES.find(s => s.slug === slug);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: 'State not found'
            });
        }

        let query = {
            approved: true,
            isAvailable: true,
            state: new RegExp(`^${state.name}$`, 'i'),
            price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
        };

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
                name: state.name,
                description: state.description,
                highlights: state.highlights
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
