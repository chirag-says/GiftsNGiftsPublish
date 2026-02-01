/**
 * Craft Routes
 * API endpoints for "Shop by Craft" feature
 */
import express from 'express';
import Craft from '../model/Craft.js';
import Product from '../model/addproduct.js';
import Category from '../model/Category.js';

const router = express.Router();

// ============================================
// GET ALL CRAFTS
// ============================================
router.get('/crafts', async (req, res) => {
    try {
        const { featured, state } = req.query;

        let query = { isActive: true };

        if (featured === 'true') {
            query.isFeatured = true;
        }
        if (state) {
            query.prominentStates = state;
        }

        const crafts = await Craft.find(query)
            .sort({ displayOrder: 1, name: 1 });

        res.json({
            success: true,
            data: crafts
        });
    } catch (error) {
        console.error('Error fetching crafts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch crafts' });
    }
});

// ============================================
// GET CRAFT BY SLUG
// Full details with FAQs
// ============================================
router.get('/crafts/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const craft = await Craft.findOne({ slug, isActive: true });

        if (!craft) {
            return res.status(404).json({
                success: false,
                message: 'Craft not found'
            });
        }

        // Get product count
        const productCount = await Product.countDocuments({
            approved: true,
            isAvailable: true,
            $or: [
                { tags: new RegExp(craft.name, 'i') },
                { title: new RegExp(craft.name, 'i') }
            ]
        });

        res.json({
            success: true,
            data: {
                ...craft.toObject(),
                productCount
            }
        });
    } catch (error) {
        console.error('Error fetching craft:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch craft' });
    }
});

// ============================================
// GET PRODUCTS BY CRAFT
// With filters and pagination
// ============================================
router.get('/crafts/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            state,
            minPrice = 0,
            maxPrice = 100000,
            sort = 'popular',
            page = 1,
            limit = 24
        } = req.query;

        const craft = await Craft.findOne({ slug, isActive: true });

        if (!craft) {
            return res.status(404).json({
                success: false,
                message: 'Craft not found'
            });
        }

        // Build query based on craft name/tags
        let query = {
            approved: true,
            isAvailable: true,
            price: { $gte: Number(minPrice), $lte: Number(maxPrice) },
            $or: [
                { tags: new RegExp(craft.name, 'i') },
                { title: new RegExp(craft.name.split(' ')[0], 'i') }
            ]
        };

        if (state) {
            query.state = state;
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
            craft: {
                name: craft.name,
                description: craft.description,
                prominentStates: craft.prominentStates
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching craft products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// ============================================
// SEED SAMPLE CRAFTS (for development)
// ============================================
router.post('/crafts/seed', async (req, res) => {
    try {
        const sampleCrafts = [
            {
                name: "Bamboo & Cane",
                slug: "bamboo-cane",
                shortDescription: "Sustainable bamboo and cane products from Northeast",
                description: "Discover eco-friendly bamboo and cane crafts from the hills of Northeast India. Each piece is handcrafted by skilled artisans using techniques passed down through generations.",
                emoji: "🎋",
                prominentStates: ["Assam", "Meghalaya", "Tripura", "Manipur"],
                history: "Bamboo craftsmanship in Northeast India dates back thousands of years. The region's abundant bamboo forests have made it an integral part of daily life and culture.",
                faqs: [
                    { question: "How to care for bamboo products?", answer: "Keep away from direct sunlight. Wipe with a damp cloth. Apply coconut oil occasionally to maintain shine." },
                    { question: "Are bamboo products durable?", answer: "Yes! Properly treated bamboo is extremely durable and can last for decades with proper care." }
                ],
                metaTitle: "Bamboo & Cane Handicrafts from Northeast India | GiftsNGifts",
                metaDescription: "Shop authentic bamboo and cane products handcrafted by artisans from Assam, Meghalaya, and Tripura. Eco-friendly gifts with pan-India delivery.",
                keywords: ["bamboo crafts", "cane products", "eco-friendly gifts", "sustainable handicrafts"],
                isActive: true,
                isFeatured: true,
                displayOrder: 1
            },
            {
                name: "Handloom & Textiles",
                slug: "handloom-textiles",
                shortDescription: "Exquisite handwoven fabrics and traditional textiles",
                description: "From the golden Muga silk of Assam to the vibrant tribal shawls of Nagaland, explore the rich textile heritage of Northeast India.",
                emoji: "🧵",
                prominentStates: ["Assam", "Nagaland", "Manipur", "Mizoram"],
                history: "Weaving is an integral part of life in Northeast India. Women learn this art from childhood, and each tribe has its distinctive patterns and motifs.",
                faqs: [
                    { question: "Is Muga silk washable?", answer: "Yes, but hand wash only in cold water with mild detergent. Never wring or twist." },
                    { question: "What makes Naga shawls special?", answer: "Each Naga shawl tells a story through its patterns. Specific designs are reserved for warriors and chieftains." }
                ],
                metaTitle: "Handloom Textiles from Northeast India | Silk, Shawls & More",
                metaDescription: "Buy authentic Muga silk, Eri silk, Naga shawls, and handwoven textiles directly from Northeast Indian weavers.",
                keywords: ["Muga silk", "Naga shawl", "handloom saree", "tribal textiles"],
                isActive: true,
                isFeatured: true,
                displayOrder: 2
            },
            {
                name: "Tea & Organic",
                slug: "tea-organic",
                shortDescription: "Premium Assam tea and organic produce",
                description: "Experience the world-famous Assam tea and organic products from the pristine hills of Northeast India. From single-estate teas to organic honey and spices.",
                emoji: "🍵",
                prominentStates: ["Assam", "Meghalaya", "Arunachal Pradesh"],
                history: "Assam is the largest tea-producing region in the world. The unique terroir gives Assam tea its distinctive malty flavor.",
                faqs: [
                    { question: "How to store Assam tea?", answer: "Store in an airtight container away from light and moisture. Best consumed within 2 years." },
                    { question: "Is the honey really organic?", answer: "Yes! Our honey comes from bees in the pristine forests of Meghalaya, far from any agricultural chemicals." }
                ],
                metaTitle: "Assam Tea & Organic Products | Premium Northeast Gifts",
                metaDescription: "Shop premium Assam tea, organic honey, turmeric, and more from Northeast India. Perfect for gifting.",
                keywords: ["Assam tea", "organic honey", "Meghalaya honey", "organic spices"],
                isActive: true,
                isFeatured: true,
                displayOrder: 3
            },
            {
                name: "Pottery & Ceramics",
                slug: "pottery-ceramics",
                shortDescription: "Traditional pottery including Longpi black pottery",
                description: "Discover the unique pottery traditions of Northeast India, including the famous Longpi black pottery of Manipur made without a potter's wheel.",
                emoji: "🏺",
                prominentStates: ["Manipur", "Assam"],
                history: "Longpi pottery is made from a special mix of serpentine stone and weathered rock, shaped entirely by hand - a rare surviving tradition.",
                faqs: [
                    { question: "Is Longpi pottery safe for cooking?", answer: "Yes! It's completely natural and has been used for cooking for centuries. It also keeps food warm longer." },
                    { question: "How is black pottery made?", answer: "The black color comes from firing in a specific way that allows carbon to penetrate the surface." }
                ],
                metaTitle: "Longpi Black Pottery & Ceramics from Northeast India",
                metaDescription: "Shop authentic Longpi black pottery from Manipur. Handcrafted without a wheel. Unique GI-tagged gifts.",
                keywords: ["Longpi pottery", "black pottery", "Manipuri pottery", "handmade ceramics"],
                isActive: true,
                isFeatured: true,
                displayOrder: 4
            },
            {
                name: "Jewelry & Ornaments",
                slug: "jewelry-ornaments",
                shortDescription: "Traditional tribal jewelry and ornaments",
                description: "Explore the stunning tribal jewelry of Northeast India. From Naga beads to Assamese jaapi-inspired earrings, each piece is a work of art.",
                emoji: "💎",
                prominentStates: ["Nagaland", "Assam", "Arunachal Pradesh"],
                history: "Jewelry in tribal Northeast India is not just ornament - it signifies social status, achievements, and tribal identity.",
                faqs: [
                    { question: "Are the beads authentic?", answer: "Yes! Our Naga beads are authentic and sourced directly from artisan families." },
                    { question: "What materials are used?", answer: "Various materials including glass beads, shells, metals, and natural stones." }
                ],
                metaTitle: "Tribal Jewelry from Northeast India | Naga Beads & More",
                metaDescription: "Shop authentic tribal jewelry from Nagaland, Arunachal Pradesh. Unique handcrafted pieces with cultural significance.",
                keywords: ["Naga jewelry", "tribal ornaments", "Northeast jewelry", "ethnic accessories"],
                isActive: true,
                isFeatured: true,
                displayOrder: 5
            },
            {
                name: "Home Decor",
                slug: "home-decor",
                shortDescription: "Handcrafted home decor items",
                description: "Transform your space with authentic Northeast Indian home decor. From bamboo lamps to handwoven wall hangings, add a touch of tribal elegance.",
                emoji: "🏠",
                prominentStates: ["Assam", "Nagaland", "Meghalaya", "Manipur", "Tripura"],
                history: "Northeast India's diverse craft traditions offer unique home decor options that blend functionality with artistry.",
                faqs: [
                    { question: "Are these suitable for modern homes?", answer: "Absolutely! Our artisans create pieces that blend traditional techniques with contemporary design." }
                ],
                metaTitle: "Handcrafted Home Decor from Northeast India",
                metaDescription: "Shop unique home decor items handcrafted by Northeast Indian artisans. Bamboo, textiles, pottery & more.",
                keywords: ["tribal home decor", "bamboo lamps", "handwoven decor", "ethnic interiors"],
                isActive: true,
                isFeatured: true,
                displayOrder: 6
            }
        ];

        // Check if crafts already exist
        const existingCount = await Craft.countDocuments();
        if (existingCount > 0) {
            return res.json({
                success: true,
                message: `${existingCount} crafts already exist. Skipping seed.`,
                data: await Craft.find({ isActive: true })
            });
        }

        const created = await Craft.insertMany(sampleCrafts);

        res.json({
            success: true,
            message: `Created ${created.length} sample crafts`,
            data: created
        });
    } catch (error) {
        console.error('Error seeding crafts:', error);
        res.status(500).json({ success: false, message: 'Failed to seed crafts' });
    }
});

export default router;
