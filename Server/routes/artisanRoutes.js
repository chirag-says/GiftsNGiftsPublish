/**
 * Artisan Routes
 * API endpoints for "Meet the Makers" feature
 */
import express from 'express';
import Artisan from '../model/Artisan.js';
import Product from '../model/addproduct.js';

const router = express.Router();

// ============================================
// GET ALL ARTISANS (with filters)
// Supports: state, craftType, featured, pagination
// ============================================
router.get('/artisans', async (req, res) => {
    try {
        const {
            state,
            craftType,
            featured,
            page = 1,
            limit = 12,
            search
        } = req.query;

        let query = { isActive: true };

        if (state) {
            query.state = state;
        }
        if (craftType) {
            query.craftType = craftType;
        }
        if (featured === 'true') {
            query.isFeatured = true;
        }
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { specialization: new RegExp(search, 'i') },
                { craftType: new RegExp(search, 'i') }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [artisans, total] = await Promise.all([
            Artisan.find(query)
                .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select('-fullStory -craftProcess -gallery'), // Exclude large fields for list
            Artisan.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: artisans,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching artisans:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch artisans' });
    }
});

// ============================================
// GET FEATURED ARTISANS (for homepage)
// Returns top 4-6 featured artisans
// ============================================
router.get('/artisans/featured', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const artisans = await Artisan.find({
            isActive: true,
            isFeatured: true
        })
            .sort({ displayOrder: 1 })
            .limit(Number(limit))
            .select('name slug profileImage state craftType specialization shortBio quote certifications');

        res.json({
            success: true,
            data: artisans
        });
    } catch (error) {
        console.error('Error fetching featured artisans:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch featured artisans' });
    }
});

// ============================================
// GET SINGLE ARTISAN BY SLUG
// Full profile with story, process, gallery
// ============================================
router.get('/artisans/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const artisan = await Artisan.findOne({ slug, isActive: true });

        if (!artisan) {
            return res.status(404).json({
                success: false,
                message: 'Artisan not found'
            });
        }

        res.json({
            success: true,
            data: artisan
        });
    } catch (error) {
        console.error('Error fetching artisan:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch artisan' });
    }
});

// ============================================
// GET ARTISAN'S PRODUCTS
// Products created by this artisan (by state match)
// ============================================
router.get('/artisans/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const artisan = await Artisan.findOne({ slug, isActive: true });

        if (!artisan) {
            return res.status(404).json({
                success: false,
                message: 'Artisan not found'
            });
        }

        // Find products from same state and craft type
        const query = {
            approved: true,
            isAvailable: true,
            state: artisan.state
        };

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('categoryname', 'categoryname')
                .sort({ isFeatured: -1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select('title price oldprice discount images rating reviewCount state'),
            Product.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: products,
            artisan: {
                name: artisan.name,
                state: artisan.state,
                craftType: artisan.craftType
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching artisan products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// ============================================
// GET ARTISANS BY STATE
// ============================================
router.get('/artisans/state/:state', async (req, res) => {
    try {
        const { state } = req.params;
        const { limit = 10 } = req.query;

        const artisans = await Artisan.find({
            state: new RegExp(`^${state}$`, 'i'),
            isActive: true
        })
            .sort({ isFeatured: -1, displayOrder: 1 })
            .limit(Number(limit))
            .select('name slug profileImage craftType specialization shortBio certifications');

        res.json({
            success: true,
            data: artisans,
            state
        });
    } catch (error) {
        console.error('Error fetching artisans by state:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch artisans' });
    }
});

// ============================================
// GET ARTISAN STATS (for homepage)
// ============================================
router.get('/artisans-stats', async (req, res) => {
    try {
        const [
            totalArtisans,
            statesRepresented,
            craftTypes
        ] = await Promise.all([
            Artisan.countDocuments({ isActive: true }),
            Artisan.distinct('state', { isActive: true }),
            Artisan.distinct('craftType', { isActive: true })
        ]);

        res.json({
            success: true,
            data: {
                totalArtisans,
                statesCount: statesRepresented.length,
                craftTypesCount: craftTypes.length,
                states: statesRepresented,
                craftTypes
            }
        });
    } catch (error) {
        console.error('Error fetching artisan stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// ============================================
// SEED SAMPLE ARTISANS (for development)
// ============================================
router.post('/artisans/seed', async (req, res) => {
    try {
        const sampleArtisans = [
            {
                name: "Lakshmi Devi",
                slug: "lakshmi-devi",
                profileImage: {
                    url: "https://res.cloudinary.com/demo/image/upload/v1/artisans/lakshmi-devi.jpg",
                    altText: "Lakshmi Devi - Muga Silk Weaver"
                },
                state: "Assam",
                village: "Sualkuchi",
                district: "Kamrup",
                craftType: "Weaving",
                specialization: "Muga Silk Weaving",
                yearsOfExperience: 35,
                shortBio: "Master weaver preserving the golden Muga silk tradition of Assam for three generations.",
                fullStory: "Born into a family of weavers in Sualkuchi, the 'Manchester of Assam', Lakshmi Devi learned the art of Muga silk weaving from her grandmother. Today, she leads a cooperative of 50 women weavers...",
                quote: "Every thread I weave carries the wisdom of my ancestors. It is not just silk; it is our identity.",
                certifications: ["GI Tag", "Handloom Mark", "Silk Mark"],
                familyMembers: 4,
                generationsInCraft: 3,
                impactStatement: "Preserving 200-year-old weaving tradition",
                isActive: true,
                isFeatured: true,
                displayOrder: 1
            },
            {
                name: "Mohan Boro",
                slug: "mohan-boro",
                profileImage: {
                    url: "https://res.cloudinary.com/demo/image/upload/v1/artisans/mohan-boro.jpg",
                    altText: "Mohan Boro - Bamboo Craftsman"
                },
                state: "Meghalaya",
                village: "Nongpoh",
                district: "Ri-Bhoi",
                craftType: "Bamboo & Cane",
                specialization: "Bamboo Furniture & Home Decor",
                yearsOfExperience: 25,
                shortBio: "Creating sustainable bamboo art from the hills of Meghalaya.",
                fullStory: "Mohan discovered his passion for bamboo craft while helping his father in their small workshop. His innovative designs blend traditional techniques with modern aesthetics...",
                quote: "Bamboo is not just a plant, it's the backbone of our culture and livelihood.",
                certifications: ["Handmade India", "Fair Trade"],
                familyMembers: 6,
                generationsInCraft: 2,
                impactStatement: "Training 100+ youth in bamboo craftsmanship",
                isActive: true,
                isFeatured: true,
                displayOrder: 2
            },
            {
                name: "Alemla Ao",
                slug: "alemla-ao",
                profileImage: {
                    url: "https://res.cloudinary.com/demo/image/upload/v1/artisans/alemla-ao.jpg",
                    altText: "Alemla Ao - Naga Shawl Weaver"
                },
                state: "Nagaland",
                village: "Mokokchung",
                district: "Mokokchung",
                craftType: "Handloom & Textiles",
                specialization: "Traditional Naga Shawls",
                yearsOfExperience: 20,
                shortBio: "Keeper of ancient Naga weaving patterns and tribal motifs.",
                fullStory: "Each pattern Alemla weaves tells a story of her Ao Naga tribe. The geometric designs represent mountains, rice terraces, and warrior traditions...",
                quote: "Our shawls are like books. Each pattern is a chapter of our history.",
                certifications: ["GI Tag", "Handloom Mark"],
                familyMembers: 3,
                generationsInCraft: 4,
                impactStatement: "Documenting 50+ endangered tribal patterns",
                isActive: true,
                isFeatured: true,
                displayOrder: 3
            },
            {
                name: "Tombi Devi",
                slug: "tombi-devi",
                profileImage: {
                    url: "https://res.cloudinary.com/demo/image/upload/v1/artisans/tombi-devi.jpg",
                    altText: "Tombi Devi - Manipuri Potter"
                },
                state: "Manipur",
                village: "Thongjao",
                district: "Kakching",
                craftType: "Pottery & Ceramics",
                specialization: "Black Pottery (Longpi)",
                yearsOfExperience: 28,
                shortBio: "Master of the rare Longpi black pottery, made without a wheel.",
                fullStory: "Longpi pottery is unique - made from serpentine stone and special clay, shaped entirely by hand without a potter's wheel. Tombi is one of the few remaining masters...",
                quote: "My hands remember the shape even when my eyes close. The clay speaks to us.",
                certifications: ["GI Tag"],
                familyMembers: 5,
                generationsInCraft: 5,
                impactStatement: "Training women's self-help groups in pottery",
                isActive: true,
                isFeatured: true,
                displayOrder: 4
            }
        ];

        // Check if artisans already exist
        const existingCount = await Artisan.countDocuments();
        if (existingCount > 0) {
            return res.json({
                success: true,
                message: `${existingCount} artisans already exist. Skipping seed.`,
                data: await Artisan.find({ isActive: true }).limit(4)
            });
        }

        const created = await Artisan.insertMany(sampleArtisans);

        res.json({
            success: true,
            message: `Created ${created.length} sample artisans`,
            data: created
        });
    } catch (error) {
        console.error('Error seeding artisans:', error);
        res.status(500).json({ success: false, message: 'Failed to seed artisans' });
    }
});

export default router;
