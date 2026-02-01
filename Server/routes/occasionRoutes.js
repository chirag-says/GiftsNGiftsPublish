/**
 * Occasion Routes
 * API endpoints for Shop by Occasion feature
 * Handles occasion categories, products, and B2B filtering
 */
import express from 'express';
import Occasion from '../model/Occasion.js';
import Product from '../model/addproduct.js';
import mongoose from 'mongoose';

const router = express.Router();

// ============================================
// GET ALL OCCASIONS WITH CATEGORIES
// Groups occasions into Corporate, Personal, Seasonal
// Supports: search query for filtering
// ============================================
router.get('/occasions', async (req, res) => {
    try {
        const { search } = req.query;

        let query = { isActive: true };

        // Search filter
        if (search) {
            query.name = new RegExp(search, 'i');
        }

        const occasions = await Occasion.find(query).sort({ displayOrder: 1, name: 1 });

        // Group occasions by their category field
        const categorized = {
            corporate: [],
            personal: [],
            seasonal: []
        };

        // Define fallback categories for occasions without category field
        const corporateKeywords = ['diwali', 'new year', 'christmas', 'client', 'employee', 'corporate', 'milestone', 'onboarding', 'farewell', 'business'];
        const personalKeywords = ['birthday', 'wedding', 'anniversary', 'housewarming', 'baby shower', 'graduation', 'thank you'];
        const seasonalKeywords = ['bihu', 'losar', 'harvest', 'spring', 'durga puja', 'holi', 'eid', 'puja', 'traditional', 'festive'];

        occasions.forEach(occasion => {
            // Use the category field if available, otherwise determine from name
            if (occasion.category) {
                categorized[occasion.category].push({
                    _id: occasion._id,
                    name: occasion.name,
                    slug: occasion.slug,
                    emoji: occasion.emoji || '🎁',
                    description: occasion.description,
                    image: occasion.image,
                    productCount: occasion.productCount || 0,
                    isFeatured: occasion.isFeatured
                });
            } else {
                // Fallback categorization based on name
                const nameLower = occasion.name.toLowerCase();

                if (corporateKeywords.some(k => nameLower.includes(k))) {
                    categorized.corporate.push(occasion);
                } else if (personalKeywords.some(k => nameLower.includes(k))) {
                    categorized.personal.push(occasion);
                } else if (seasonalKeywords.some(k => nameLower.includes(k))) {
                    categorized.seasonal.push(occasion);
                } else {
                    categorized.personal.push(occasion);
                }
            }
        });

        res.json({
            success: true,
            data: categorized,
            total: occasions.length,
            all: occasions // Return all occasions for search functionality
        });
    } catch (error) {
        console.error('Error fetching occasions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch occasions' });
    }
});

// ============================================
// GET SINGLE OCCASION BY SLUG
// ============================================
router.get('/occasions/:slug', async (req, res) => {
    try {
        const occasion = await Occasion.findOne({ slug: req.params.slug, isActive: true });
        if (!occasion) {
            return res.status(404).json({ success: false, message: 'Occasion not found' });
        }
        res.json({ success: true, data: occasion });
    } catch (error) {
        console.error('Error fetching occasion:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch occasion' });
    }
});

// ============================================
// GET PRODUCTS BY OCCASION WITH B2B FILTERS
// Supports: budget, quantity, recipient, productType, customization
// ============================================
router.get('/occasions/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const {
            minQuantity = 1,
            recipient,
            productType,
            customization,
            sort = 'popular',
            page = 1,
            limit = 24,
            collection // For curated collections
        } = req.query;

        // Find occasion by slug
        const occasion = await Occasion.findOne({ slug, isActive: true });
        if (!occasion) {
            return res.status(404).json({ success: false, message: 'Occasion not found' });
        }

        // Build query
        let query = {
            approved: true,
            isAvailable: true,
            occasions: { $in: [occasion.name] }
        };

        // Only add price filter if explicitly provided (not for default browsing)
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
        }

        // MOQ filter for bulk orders
        if (minQuantity > 1) {
            query.moq = { $lte: Number(minQuantity) };
        }

        // Product type filter (category-based)
        if (productType && productType !== 'all') {
            const category = await mongoose.model('Category').findOne({
                categoryname: new RegExp(productType, 'i')
            });
            if (category) {
                query.categoryname = category._id;
            }
        }

        // Collection filters
        if (collection) {
            switch (collection) {
                case 'premium-client':
                    query.price = { $gte: 2500, $lte: 5000 };
                    break;
                case 'employee-appreciation':
                    query.price = { $gte: 500, $lte: 1500 };
                    break;
                case 'budget-friendly':
                    query.price = { $lte: 500 };
                    break;
                case 'express':
                    // Products with good stock (ships faster)
                    query.stock = { $gte: 50 };
                    break;
            }
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
                sortOption = { isFeatured: -1, createdAt: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(query)
                .populate('categoryname', 'categoryname')
                .populate('subcategory', 'subcategoryname')
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        // Add metadata for B2B features
        const enhancedProducts = products.map(product => {
            const p = product.toObject();

            // Calculate bulk pricing tiers
            p.bulkPricing = calculateBulkPricing(p.price);

            // Add "Perfect For" tags
            p.perfectFor = getPerfectForTags(p);

            // Customization availability
            p.customizationAvailable = checkCustomizationAvailable(p);

            return p;
        });

        res.json({
            success: true,
            data: {
                occasion,
                products: enhancedProducts,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching occasion products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});

// ============================================
// GET CURATED COLLECTIONS FOR AN OCCASION
// ============================================
router.get('/occasions/:slug/collections', async (req, res) => {
    try {
        const { slug } = req.params;

        const occasion = await Occasion.findOne({ slug, isActive: true });
        if (!occasion) {
            return res.status(404).json({ success: false, message: 'Occasion not found' });
        }

        // Define collections with dynamic counts
        const baseQuery = {
            approved: true,
            isAvailable: true,
            occasions: { $in: [occasion.name] }
        };

        const [premiumCount, employeeCount, budgetCount, expressCount] = await Promise.all([
            Product.countDocuments({ ...baseQuery, price: { $gte: 2500, $lte: 5000 } }),
            Product.countDocuments({ ...baseQuery, price: { $gte: 500, $lte: 1500 } }),
            Product.countDocuments({ ...baseQuery, price: { $lte: 500 } }),
            Product.countDocuments({ ...baseQuery, stock: { $gte: 50 } })
        ]);

        const collections = [
            {
                id: 'premium-client',
                name: 'Premium Client Hampers',
                emoji: '🎁',
                priceRange: '₹2500-5000',
                description: 'Impress high-value clients with luxury Northeast treasures',
                count: premiumCount
            },
            {
                id: 'employee-appreciation',
                name: 'Employee Appreciation Sets',
                emoji: '🎊',
                priceRange: '₹500-1500',
                description: 'Thoughtful gifts to show you care',
                count: employeeCount
            },
            {
                id: 'budget-friendly',
                name: 'Budget-Friendly Bulk',
                emoji: '🌟',
                priceRange: 'Under ₹500',
                description: 'Perfect for large teams',
                count: budgetCount
            },
            {
                id: 'express',
                name: 'Last-Minute Express',
                emoji: '⚡',
                priceRange: 'Ships in 3 days',
                description: 'Quick delivery without compromise',
                count: expressCount
            }
        ];

        res.json({
            success: true,
            data: collections.filter(c => c.count > 0)
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch collections' });
    }
});

// ============================================
// GIFT FINDER QUIZ - GET RECOMMENDATIONS
// ============================================
router.post('/gift-finder', async (req, res) => {
    try {
        const {
            recipient,      // 'high-value-clients', 'regular-clients', 'employees', 'partners', 'mixed'
            budget,         // 'under-500', '500-1000', '1000-2500', '2500-5000', '5000-plus'
            quantity,       // '1-25', '25-50', '50-100', '100-500', '500-plus'
            dietary,        // 'vegetarian', 'vegan', 'no-restriction', 'halal'
            preference,     // 'practical', 'decorative', 'mixed'
            occasion        // Occasion slug
        } = req.body;

        // Build query based on quiz answers
        let query = {
            approved: true,
            isAvailable: true
        };

        // Budget filter
        const budgetRanges = {
            'under-500': { $lte: 500 },
            '500-1000': { $gte: 500, $lte: 1000 },
            '1000-2500': { $gte: 1000, $lte: 2500 },
            '2500-5000': { $gte: 2500, $lte: 5000 },
            '5000-plus': { $gte: 5000 }
        };
        if (budget && budgetRanges[budget]) {
            query.price = budgetRanges[budget];
        }

        // Occasion filter
        if (occasion) {
            const occasionDoc = await Occasion.findOne({ slug: occasion });
            if (occasionDoc) {
                query.occasions = { $in: [occasionDoc.name] };
            }
        }

        // Quantity (MOQ) filter
        const quantityRanges = {
            '1-25': 25,
            '25-50': 50,
            '50-100': 100,
            '100-500': 500,
            '500-plus': 1000
        };
        if (quantity && quantityRanges[quantity]) {
            query.moq = { $lte: quantityRanges[quantity] };
        }

        // Get products and score them
        const products = await Product.find(query)
            .populate('categoryname', 'categoryname')
            .limit(50);

        // Score products based on answers
        const scoredProducts = products.map(product => {
            let score = 50; // Base score
            const p = product.toObject();

            // Recipient scoring
            if (recipient === 'high-value-clients' && p.price >= 2000) score += 20;
            if (recipient === 'employees' && p.price >= 500 && p.price <= 1500) score += 20;
            if (recipient === 'regular-clients' && p.price >= 800 && p.price <= 2000) score += 20;

            // Preference scoring
            const decorativeCategories = ['Handicrafts', 'Home Decor', 'Art'];
            const practicalCategories = ['Food', 'Tea', 'Beverages', 'Textiles'];

            const categoryName = p.categoryname?.categoryname || '';
            if (preference === 'decorative' && decorativeCategories.some(c => categoryName.includes(c))) {
                score += 15;
            }
            if (preference === 'practical' && practicalCategories.some(c => categoryName.includes(c))) {
                score += 15;
            }

            // Featured products get bonus
            if (p.isFeatured) score += 10;

            // Good stock gets bonus
            if (p.stock >= 50) score += 5;

            p.matchScore = Math.min(score, 100);
            p.bulkPricing = calculateBulkPricing(p.price);
            p.perfectFor = getPerfectForTags(p);

            return p;
        });

        // Sort by score
        scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

        // Take top 3 recommendations
        const recommendations = scoredProducts.slice(0, 3).map((p, idx) => ({
            ...p,
            rank: idx === 0 ? 'top' : idx === 1 ? 'alternative' : 'budget',
            label: idx === 0 ? '🏆 TOP MATCH' : idx === 1 ? '🥈 GREAT ALTERNATIVE' : '🥉 BUDGET-FRIENDLY'
        }));

        res.json({
            success: true,
            data: {
                recommendations,
                totalMatches: scoredProducts.length
            }
        });
    } catch (error) {
        console.error('Error in gift finder:', error);
        res.status(500).json({ success: false, message: 'Failed to get recommendations' });
    }
});

// ============================================
// COMPARE PRODUCTS
// ============================================
router.post('/compare', async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || productIds.length < 2 || productIds.length > 4) {
            return res.status(400).json({
                success: false,
                message: 'Please select 2-4 products to compare'
            });
        }

        const products = await Product.find({
            _id: { $in: productIds },
            approved: true
        }).populate('categoryname', 'categoryname');

        const comparisonData = products.map(product => {
            const p = product.toObject();
            return {
                _id: p._id,
                title: p.title,
                image: p.images?.[0]?.url,
                price: p.price,
                oldprice: p.oldprice,
                discount: p.discount,
                rating: p.rating || 4.5,
                reviewCount: p.reviewCount || 0,
                category: p.categoryname?.categoryname,
                state: p.state,
                occasions: p.occasions,
                stock: p.stock,
                moq: p.moq,
                bulkPricing: calculateBulkPricing(p.price),
                perfectFor: getPerfectForTags(p),
                customizationAvailable: checkCustomizationAvailable(p),
                deliveryDays: estimateDeliveryDays(p),
                features: extractFeatures(p)
            };
        });

        res.json({
            success: true,
            data: comparisonData
        });
    } catch (error) {
        console.error('Error comparing products:', error);
        res.status(500).json({ success: false, message: 'Failed to compare products' });
    }
});

// ============================================
// REQUEST BULK QUOTE
// ============================================
router.post('/bulk-quote', async (req, res) => {
    try {
        const {
            productId,
            quantity,
            companyName,
            contactName,
            email,
            phone,
            customization,
            message,
            occasion
        } = req.body;

        // Validate required fields
        if (!productId || !quantity || !companyName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Calculate estimated pricing
        const bulkPricing = calculateBulkPricing(product.price);
        let estimatedPrice = product.price;

        if (quantity >= 500) estimatedPrice = bulkPricing.tier500;
        else if (quantity >= 100) estimatedPrice = bulkPricing.tier100;
        else if (quantity >= 50) estimatedPrice = bulkPricing.tier50;

        const totalEstimate = estimatedPrice * quantity;

        // In production, you would save this to a BulkQuoteRequest model
        // and send email notifications

        res.json({
            success: true,
            data: {
                quoteId: `BQ-${Date.now()}`,
                product: {
                    title: product.title,
                    image: product.images?.[0]?.url
                },
                quantity,
                unitPrice: estimatedPrice,
                totalEstimate,
                message: 'Our corporate sales team will contact you within 24 hours with a detailed quote.',
                customization: customization || {}
            }
        });
    } catch (error) {
        console.error('Error creating bulk quote:', error);
        res.status(500).json({ success: false, message: 'Failed to create quote request' });
    }
});

// ============================================
// SEED DEFAULT OCCASIONS
// ============================================
router.post('/occasions/seed', async (req, res) => {
    try {
        const defaultOccasions = [
            // Corporate Occasions
            { name: 'Diwali', slug: 'diwali', category: 'corporate', emoji: '🪔', description: 'Celebrate the festival of lights with authentic Northeast gifts', displayOrder: 1, image: { url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400', altText: 'Diwali Gifting' }, popularFor: ['Clients', 'Employees', 'Partners'], isFeatured: true },
            { name: 'New Year', slug: 'new-year', category: 'corporate', emoji: '🎄', description: 'Ring in the new year with memorable corporate gifts', displayOrder: 2, image: { url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400', altText: 'New Year Gifts' }, popularFor: ['Clients', 'Team'] },
            { name: 'Christmas', slug: 'christmas', category: 'corporate', emoji: '🎅', description: 'Spread holiday cheer with handcrafted treasures', displayOrder: 3, image: { url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a814?w=400', altText: 'Christmas Gifts' }, popularFor: ['Clients', 'Employees'] },
            { name: 'Client Appreciation', slug: 'client-appreciation', category: 'corporate', emoji: '🏢', description: 'Show gratitude to your valued clients', displayOrder: 4, image: { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', altText: 'Client Appreciation' }, popularFor: ['VIP Clients', 'Clients'], isFeatured: true },
            { name: 'Employee Gifts', slug: 'employee-gifts', category: 'corporate', emoji: '👔', description: 'Recognize and reward your team', displayOrder: 5, image: { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', altText: 'Employee Gifts' }, popularFor: ['Employees', 'Team'] },
            { name: 'Corporate Gifting', slug: 'corporate-gifting', category: 'corporate', emoji: '🤝', description: 'Professional gifts for business relationships', displayOrder: 6, image: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', altText: 'Corporate Gifting' }, popularFor: ['Clients', 'Partners', 'Vendors'], isFeatured: true },
            { name: 'Company Milestone', slug: 'company-milestone', category: 'corporate', emoji: '🎊', description: 'Celebrate achievements and anniversaries', displayOrder: 7, image: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', altText: 'Company Milestone' }, popularFor: ['Team', 'Partners'] },
            { name: 'Onboarding Kits', slug: 'onboarding-kits', category: 'corporate', emoji: '🎓', description: 'Welcome new team members with thoughtful gifts', displayOrder: 8, image: { url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400', altText: 'Onboarding Kits' }, popularFor: ['Employees'] },
            { name: 'Farewell Gifts', slug: 'farewell-gifts', category: 'corporate', emoji: '👋', description: 'Meaningful goodbye gifts for departing colleagues', displayOrder: 9, image: { url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400', altText: 'Farewell Gifts' }, popularFor: ['Employees'] },

            // Personal Occasions
            { name: 'Birthday', slug: 'birthday', category: 'personal', emoji: '🎂', description: 'Make birthdays special with unique handcrafted gifts', displayOrder: 10, image: { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400', altText: 'Birthday Gifts' }, popularFor: ['Family', 'Friends'], isFeatured: true },
            { name: 'Wedding', slug: 'wedding', category: 'personal', emoji: '💍', description: 'Celebrate love with traditional Northeast treasures', displayOrder: 11, image: { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', altText: 'Wedding Gifts' }, popularFor: ['Family', 'Friends'], isFeatured: true },
            { name: 'Anniversary', slug: 'anniversary', category: 'personal', emoji: '💝', description: 'Honor milestones with heartfelt gifts', displayOrder: 12, image: { url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400', altText: 'Anniversary Gifts' }, popularFor: ['Family'] },
            { name: 'Housewarming', slug: 'housewarming', category: 'personal', emoji: '🏠', description: 'Welcome new homes with beautiful decor gifts', displayOrder: 13, image: { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', altText: 'Housewarming Gifts' }, popularFor: ['Family', 'Friends'] },
            { name: 'Baby Shower', slug: 'baby-shower', category: 'personal', emoji: '👶', description: 'Celebrate new arrivals with adorable gifts', displayOrder: 14, image: { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', altText: 'Baby Shower Gifts' }, popularFor: ['Family', 'Friends'] },

            // Seasonal & Cultural
            { name: 'Bihu', slug: 'bihu', category: 'seasonal', emoji: '🌾', description: 'Celebrate Assamese New Year with traditional gifts', displayOrder: 15, image: { url: 'https://images.unsplash.com/photo-1584377029377-d4b57cbaed4b?w=400', altText: 'Bihu Festival' }, popularFor: ['Family', 'Team'], isFeatured: true },
            { name: 'Durga Puja', slug: 'durga-puja', category: 'seasonal', emoji: '🪔', description: 'Honor the goddess with festive gifts', displayOrder: 16, image: { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', altText: 'Durga Puja' }, popularFor: ['Family', 'Clients'] },
            { name: 'Holi', slug: 'holi', category: 'seasonal', emoji: '🌸', description: 'Celebrate colors with vibrant gifts', displayOrder: 17, image: { url: 'https://images.unsplash.com/photo-1576080733542-a8e4e1a21a84?w=400', altText: 'Holi Festival' }, popularFor: ['Family', 'Friends'] },
            { name: 'Festive Season', slug: 'festive-season', category: 'seasonal', emoji: '🎋', description: 'All-purpose festive gifts for any celebration', displayOrder: 18, image: { url: 'https://images.unsplash.com/photo-1577702316006-6a54d6f29f37?w=400', altText: 'Festive Season' }, popularFor: ['Everyone'] },
            { name: 'Traditional Ceremony', slug: 'traditional-ceremony', category: 'seasonal', emoji: '🎎', description: 'Honor traditions with authentic handicrafts', displayOrder: 19, image: { url: 'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?w=400', altText: 'Traditional Ceremony' }, popularFor: ['Family'] }
        ];

        for (const occasion of defaultOccasions) {
            await Occasion.findOneAndUpdate(
                { slug: occasion.slug },
                occasion,
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            message: `Seeded ${defaultOccasions.length} occasions`
        });
    } catch (error) {
        console.error('Error seeding occasions:', error);
        res.status(500).json({ success: false, message: 'Failed to seed occasions' });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateBulkPricing(basePrice) {
    return {
        unit: basePrice,
        tier50: Math.round(basePrice * 0.90),   // 10% off for 50+
        tier100: Math.round(basePrice * 0.85),  // 15% off for 100+
        tier500: Math.round(basePrice * 0.80)   // 20% off for 500+
    };
}

function getPerfectForTags(product) {
    const tags = [];
    const price = product.price;

    if (price >= 2500) tags.push('VIP Clients');
    if (price >= 1000 && price <= 3000) tags.push('Clients');
    if (price >= 500 && price <= 1500) tags.push('Employees');
    if (price >= 800 && price <= 2500) tags.push('Business Partners');
    if (price <= 500) tags.push('Large Teams');

    return tags.length > 0 ? tags : ['General Gifting'];
}

function checkCustomizationAvailable(product) {
    // Check if product or category supports customization
    return {
        logo: true,
        message: true,
        packaging: product.price >= 500
    };
}

function estimateDeliveryDays(product) {
    if (product.stock >= 100) return '3-5 days';
    if (product.stock >= 50) return '5-7 days';
    return '7-10 days';
}

function extractFeatures(product) {
    const features = [];

    if (product.state) features.push(`From ${product.state}`);
    if (product.materialComposition) features.push(product.materialComposition);
    if (product.brand) features.push(`Brand: ${product.brand}`);
    if (product.countryOfOrigin) features.push(`Made in ${product.countryOfOrigin}`);

    return features.slice(0, 5);
}

export default router;
