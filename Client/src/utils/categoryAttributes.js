/**
 * Category-specific product attributes configuration
 * GS1/Shopify-standard product data schema
 * This file defines dynamic fields that appear based on selected category
 */

// Field types for consistent handling
export const FIELD_TYPES = {
    TEXT: 'text',
    NUMBER: 'number',
    SELECT: 'select',
    TEXTAREA: 'textarea',
    COLOR: 'color',
    DATE: 'date',
    MULTISELECT: 'multiselect'
};

// Common fields that appear for most products
export const COMMON_FIELDS = [
    {
        name: 'brand',
        label: 'Brand/Artisan Name',
        type: FIELD_TYPES.TEXT,
        required: false,
        placeholder: 'Enter brand or artisan name'
    },
    {
        name: 'material',
        label: 'Primary Material',
        type: FIELD_TYPES.TEXT,
        required: false,
        placeholder: 'e.g., Cotton, Silk, Clay, Wood'
    },
    {
        name: 'care_instructions',
        label: 'Care Instructions',
        type: FIELD_TYPES.TEXTAREA,
        required: false,
        placeholder: 'How to care for this product'
    }
];

// Category-specific attributes - Using EXACT category names from database
export const CATEGORY_ATTRIBUTES = {

    // ==================== HANDCRAFTED TEAWARES ====================
    'handcrafted_teawares': {
        label: 'Handcrafted Teawares',
        keywords: ['teaware', 'tea', 'teapot', 'cup', 'kettle', 'handcrafted tea', 'handcrafted teawares'],
        fields: [
            {
                name: 'teaware_type',
                label: 'Teaware Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Teapot', 'Tea Cup', 'Tea Set', 'Tea Kettle', 'Tea Tray', 'Tea Strainer', 'Tea Caddy', 'Saucer', 'Sugar Bowl', 'Milk Jug', 'Other'],
                placeholder: 'Select type'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Ceramic', 'Porcelain', 'Clay', 'Terracotta', 'Bone China', 'Glass', 'Bamboo', 'Wood', 'Metal', 'Cast Iron', 'Other'],
                placeholder: 'Select material'
            },
            {
                name: 'capacity',
                label: 'Capacity (ml)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 250'
            },
            {
                name: 'set_pieces',
                label: 'Number of Pieces (if set)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 6'
            },
            {
                name: 'art_style',
                label: 'Art Style/Design',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Traditional, Tribal, Contemporary'
            },
            {
                name: 'handmade',
                label: 'Handmade',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes', 'Partially Handmade', 'No'],
                default: 'Yes'
            },
            {
                name: 'microwave_safe',
                label: 'Microwave Safe',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'dishwasher_safe',
                label: 'Dishwasher Safe',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== BAMBOO AND CANES ====================
    'bamboo_canes': {
        label: 'Bamboo & Cane Products',
        keywords: ['bamboo', 'cane', 'canes', 'rattan', 'wicker', 'bamboo and canes'],
        fields: [
            {
                name: 'product_type',
                label: 'Product Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Basket', 'Furniture', 'Home Decor', 'Storage Box', 'Lamp/Lighting', 'Tray', 'Mat', 'Handicraft', 'Utility Item', 'Gift Item', 'Other'],
                placeholder: 'Select type'
            },
            {
                name: 'material_type',
                label: 'Material Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Bamboo', 'Cane', 'Rattan', 'Wicker', 'Mixed'],
                placeholder: 'Select material'
            },
            {
                name: 'dimensions',
                label: 'Dimensions (L x W x H in cm)',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 30 x 20 x 15'
            },
            {
                name: 'weight',
                label: 'Weight (grams)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 500'
            },
            {
                name: 'finish',
                label: 'Finish Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Natural', 'Polished', 'Lacquered', 'Painted', 'Varnished'],
                default: 'Natural'
            },
            {
                name: 'handmade',
                label: 'Handmade',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'eco_friendly',
                label: 'Eco-Friendly',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'artisan_region',
                label: 'Artisan Region/Origin',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Tripura, Assam, Northeast India'
            }
        ]
    },

    // ==================== CAKES & BAKERY ====================
    'cakes': {
        label: 'Cakes & Bakery',
        keywords: ['cake', 'cakes', 'bakery', 'pastry', 'dessert', 'sweet', 'brownie', 'cupcake'],
        fields: [
            {
                name: 'cake_type',
                label: 'Cake Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Birthday Cake', 'Wedding Cake', 'Anniversary Cake', 'Chocolate Cake', 'Fruit Cake', 'Black Forest', 'Red Velvet', 'Cheesecake', 'Cupcakes', 'Brownies', 'Pastries', 'Cookies', 'Custom Cake', 'Eggless Cake', 'Photo Cake', 'Tier Cake', 'Other'],
                placeholder: 'Select cake type'
            },
            {
                name: 'flavor',
                label: 'Flavor',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Chocolate', 'Vanilla', 'Strawberry', 'Butterscotch', 'Pineapple', 'Mango', 'Coffee', 'Blueberry', 'Mixed Fruit', 'Red Velvet', 'Black Forest', 'Oreo', 'Caramel', 'Hazelnut', 'Custom', 'Other'],
                placeholder: 'Select flavor'
            },
            {
                name: 'weight_kg',
                label: 'Weight',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['250g', '500g', '0.5 kg', '1 kg', '1.5 kg', '2 kg', '2.5 kg', '3 kg', '4 kg', '5 kg', 'Custom'],
                placeholder: 'Select weight'
            },
            {
                name: 'egg_type',
                label: 'Egg Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Egg', 'Eggless'],
                default: 'Egg'
            },
            {
                name: 'shape',
                label: 'Shape',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Round', 'Square', 'Rectangle', 'Heart', 'Custom Shape', 'Tier', 'Number Shaped', 'Letter Shaped'],
                default: 'Round'
            },
            {
                name: 'serves',
                label: 'Serves (number of people)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 10'
            },
            {
                name: 'customization',
                label: 'Customization Available',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'advance_order',
                label: 'Advance Order Required (hours)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['2 hours', '4 hours', '6 hours', '12 hours', '24 hours', '48 hours', '72 hours', 'Same Day Delivery'],
                placeholder: 'Select time'
            },
            {
                name: 'frosting_type',
                label: 'Frosting/Icing Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Buttercream', 'Whipped Cream', 'Fondant', 'Ganache', 'Cream Cheese', 'Royal Icing', 'No Frosting'],
                placeholder: 'Select frosting'
            },
            {
                name: 'ingredients',
                label: 'Key Ingredients',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'List main ingredients'
            },
            {
                name: 'allergens',
                label: 'Allergen Information',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Contains nuts, dairy, gluten'
            },
            {
                name: 'shelf_life',
                label: 'Shelf Life',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Same Day', '1 Day', '2-3 Days', '1 Week', '2 Weeks', '1 Month'],
                placeholder: 'Select shelf life'
            },
            {
                name: 'storage_instructions',
                label: 'Storage Instructions',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Refrigerate', 'Room Temperature', 'Freeze', 'Cool & Dry Place'],
                default: 'Refrigerate'
            },
            {
                name: 'fssai_licensed',
                label: 'FSSAI Licensed',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            }
        ]
    },

    // ==================== SAREES ====================
    'sarees': {
        label: 'Sarees',
        keywords: ['saree', 'sarees', 'sari', 'saris'],
        fields: [
            {
                name: 'saree_type',
                label: 'Saree Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Silk Saree', 'Cotton Saree', 'Georgette', 'Chiffon', 'Crepe', 'Organza', 'Linen', 'Khadi', 'Handloom', 'Designer', 'Printed', 'Embroidered', 'Kanjivaram', 'Banarasi', 'Chanderi', 'Paithani', 'Tussar', 'Other'],
                placeholder: 'Select saree type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pure Silk', 'Art Silk', 'Cotton', 'Cotton Silk', 'Georgette', 'Chiffon', 'Crepe', 'Organza', 'Linen', 'Khadi', 'Net', 'Satin', 'Velvet', 'Tussar', 'Mul Cotton', 'Other'],
                placeholder: 'Select fabric'
            },
            {
                name: 'length',
                label: 'Saree Length (meters)',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['5.5 meters', '6 meters', '6.3 meters', '6.5 meters', '9 meters', 'Other'],
                default: '5.5 meters'
            },
            {
                name: 'blouse_piece',
                label: 'Blouse Piece Included',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes (Unstitched)', 'Yes (Stitched)', 'No'],
                default: 'Yes (Unstitched)'
            },
            {
                name: 'blouse_length',
                label: 'Blouse Piece Length',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['0.75 meters', '0.8 meters', '0.9 meters', '1 meter', 'Running Blouse', 'N/A'],
                placeholder: 'Select length'
            },
            {
                name: 'work_type',
                label: 'Work/Embellishment Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Zari Work', 'Embroidery', 'Printed', 'Sequin', 'Stone Work', 'Thread Work', 'Mirror Work', 'Plain', 'Digital Print', 'Hand Painted', 'Bandhani', 'Block Print', 'Other'],
                placeholder: 'Select work type'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Casual', 'Party', 'Wedding', 'Festival', 'Office Wear', 'Daily Wear', 'Bridal', 'Reception', 'Special Occasion'],
                placeholder: 'Select occasion'
            },
            {
                name: 'border_type',
                label: 'Border Type',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Zari border, Temple border'
            },
            {
                name: 'pallu_type',
                label: 'Pallu Design',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Describe pallu design'
            },
            {
                name: 'pattern',
                label: 'Pattern',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Solid', 'Floral', 'Paisley', 'Geometric', 'Traditional', 'Abstract', 'Animal Print', 'Stripes', 'Checks'],
                placeholder: 'Select pattern'
            },
            {
                name: 'color',
                label: 'Primary Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Red, Gold, Blue'
            },
            {
                name: 'wash_care',
                label: 'Wash Care',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Dry Clean Only', 'Hand Wash', 'Machine Wash', 'Dry Clean Recommended'],
                default: 'Dry Clean Recommended'
            },
            {
                name: 'weave_origin',
                label: 'Weave/Origin',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Banarasi, Kanjivaram, Chanderi'
            },
            {
                name: 'gi_tag',
                label: 'GI Tag Certified',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'handwoven',
                label: 'Handwoven',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== BANARASI SAREE ====================
    'banarasi_saree': {
        label: 'Banarasi Saree',
        keywords: ['banarasi', 'banaras', 'varanasi', 'banarasi saree'],
        fields: [
            {
                name: 'banarasi_type',
                label: 'Banarasi Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Katan Silk', 'Organza (Kora)', 'Georgette', 'Shattir', 'Tissue', 'Jangla', 'Tanchoi', 'Cutwork', 'Butidar', 'Other'],
                placeholder: 'Select type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pure Silk', 'Katan Silk', 'Art Silk', 'Organza', 'Georgette', 'Tissue'],
                placeholder: 'Select fabric'
            },
            {
                name: 'zari_type',
                label: 'Zari Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Real Gold Zari', 'Real Silver Zari', 'Tested Zari', 'Imitation Zari', 'Copper Zari'],
                placeholder: 'Select zari type'
            },
            {
                name: 'weave_pattern',
                label: 'Weave Pattern',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Jangla', 'Tanchoi', 'Butidar', 'Cutwork', 'Jaal', 'Shikargah', 'Kadwa', 'Meenakari'],
                placeholder: 'Select pattern'
            },
            {
                name: 'length',
                label: 'Saree Length (meters)',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['5.5 meters', '6 meters', '6.3 meters'],
                default: '5.5 meters'
            },
            {
                name: 'blouse_piece',
                label: 'Blouse Piece Included',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes (Unstitched)', 'No'],
                default: 'Yes (Unstitched)'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Bridal', 'Wedding', 'Party', 'Festival', 'Special Occasion', 'Reception'],
                placeholder: 'Select occasion'
            },
            {
                name: 'border_design',
                label: 'Border Design',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Meenakari, Temple, Floral'
            },
            {
                name: 'pallu_design',
                label: 'Pallu Design',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Describe pallu design'
            },
            {
                name: 'color',
                label: 'Primary Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Red, Magenta, Royal Blue'
            },
            {
                name: 'handwoven',
                label: 'Handwoven',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'gi_tag',
                label: 'GI Tag Certified',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'wash_care',
                label: 'Wash Care',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Dry Clean Only', 'Dry Clean Recommended'],
                default: 'Dry Clean Only'
            }
        ]
    },

    // ==================== SHAWLS ====================
    'shawls': {
        label: 'Shawls',
        keywords: ['shawl', 'shawls', 'stole', 'wrap', 'dupatta'],
        fields: [
            {
                name: 'shawl_type',
                label: 'Shawl Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pashmina', 'Cashmere', 'Wool', 'Silk', 'Cotton', 'Handloom', 'Embroidered', 'Printed', 'Stole', 'Dupatta', 'Kani Shawl', 'Jamawar', 'Other'],
                placeholder: 'Select shawl type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pure Wool', 'Pashmina', 'Cashmere', 'Silk', 'Silk Wool', 'Cotton', 'Acrylic', 'Blended', 'Shahtoosh'],
                placeholder: 'Select fabric'
            },
            {
                name: 'dimensions',
                label: 'Dimensions (L x W in inches)',
                type: FIELD_TYPES.TEXT,
                required: true,
                placeholder: 'e.g., 80 x 40'
            },
            {
                name: 'work_type',
                label: 'Work/Embroidery Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Sozni Embroidery', 'Aari Work', 'Kani Weave', 'Printed', 'Plain', 'Machine Embroidery', 'Hand Embroidery', 'Kashmiri Embroidery', 'Other'],
                placeholder: 'Select work type'
            },
            {
                name: 'pattern',
                label: 'Pattern/Design',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Paisley, Floral, Geometric'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Casual', 'Party', 'Wedding', 'Festival', 'Office', 'Daily Wear', 'Winter Wear'],
                placeholder: 'Select occasion'
            },
            {
                name: 'weight',
                label: 'Weight (grams)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 250'
            },
            {
                name: 'warmth_level',
                label: 'Warmth Level',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Light', 'Medium', 'Warm', 'Very Warm'],
                placeholder: 'Select warmth level'
            },
            {
                name: 'handmade',
                label: 'Handmade/Handwoven',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'origin',
                label: 'Origin',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Kashmir, Tripura, Manipur'
            },
            {
                name: 'wash_care',
                label: 'Wash Care',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Dry Clean Only', 'Hand Wash', 'Dry Clean Recommended'],
                default: 'Dry Clean Recommended'
            }
        ]
    },

    // ==================== TRIPURA JEWELLERY ====================
    'tripura_jewellery': {
        label: 'Tripura Jewellery',
        keywords: ['tripura', 'jewellery', 'jewelry', 'tribal', 'ornament', 'tripura jewellery'],
        fields: [
            {
                name: 'jewellery_type',
                label: 'Jewellery Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Necklace', 'Earrings', 'Bangles', 'Bracelet', 'Anklet', 'Ring', 'Nose Pin', 'Hair Accessory', 'Pendant', 'Complete Set', 'Maang Tikka', 'Choker', 'Other'],
                placeholder: 'Select jewellery type'
            },
            {
                name: 'material',
                label: 'Primary Material',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Silver', 'German Silver', 'Brass', 'Copper', 'Alloy', 'Beads', 'Wood', 'Bamboo', 'Shell', 'Bone', 'Oxidized Metal', 'Mixed'],
                placeholder: 'Select material'
            },
            {
                name: 'tribal_design',
                label: 'Tribal/Traditional Design',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Traditional Tripuri', 'Chakma', 'Reang', 'Jamatia', 'Tribal Fusion', 'Contemporary', 'Mog', 'Lushai', 'Other'],
                placeholder: 'Select design style'
            },
            {
                name: 'plating',
                label: 'Plating/Finish',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Gold Plated', 'Silver Plated', 'Oxidized', 'Antique Finish', 'Natural', 'Rhodium Plated', 'Rose Gold Plated'],
                placeholder: 'Select plating'
            },
            {
                name: 'weight',
                label: 'Weight (grams)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 50'
            },
            {
                name: 'dimensions',
                label: 'Dimensions/Size',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 18 inches length, 2.5 cm diameter'
            },
            {
                name: 'stone_beads',
                label: 'Stones/Beads Used',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Red beads, Turquoise, Glass beads'
            },
            {
                name: 'handmade',
                label: 'Handmade',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Daily Wear', 'Festival', 'Wedding', 'Party', 'Traditional Event', 'Gift', 'Ethnic Wear'],
                placeholder: 'Select occasion'
            },
            {
                name: 'gender',
                label: 'Gender',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Women', 'Men', 'Unisex', 'Girls', 'Boys'],
                default: 'Women'
            },
            {
                name: 'closure_type',
                label: 'Closure Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Hook', 'Lobster Clasp', 'Spring Ring', 'Screw Back', 'Push Back', 'Adjustable', 'Tie-up', 'None'],
                placeholder: 'Select closure type'
            }
        ]
    },

    // ==================== WOMEN WEAR ====================
    'women_wear': {
        label: 'Women Wear',
        keywords: ['women', 'woman', 'ladies', 'female', 'wear', 'dress', 'kurti', 'suit', 'women wear'],
        fields: [
            {
                name: 'garment_type',
                label: 'Garment Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Kurti', 'Salwar Suit', 'Anarkali', 'Dress', 'Top', 'Blouse', 'Palazzo', 'Lehenga', 'Gown', 'Tunic', 'Indo-Western', 'Skirt', 'Ethnic Set', 'Sharara', 'Gharara', 'Kaftan', 'Other'],
                placeholder: 'Select garment type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Crepe', 'Rayon', 'Linen', 'Khadi', 'Velvet', 'Net', 'Satin', 'Polyester', 'Blended', 'Chanderi', 'Muslin'],
                placeholder: 'Select fabric'
            },
            {
                name: 'size',
                label: 'Available Sizes',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', 'Free Size', 'Custom Size', 'All Sizes Available'],
                placeholder: 'Select sizes'
            },
            {
                name: 'length',
                label: 'Length',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Short', 'Knee Length', 'Calf Length', 'Ankle Length', 'Floor Length', 'Midi'],
                placeholder: 'Select length'
            },
            {
                name: 'sleeve_type',
                label: 'Sleeve Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Sleeveless', 'Half Sleeve', 'Three-Quarter Sleeve', 'Full Sleeve', 'Cap Sleeve', 'Cold Shoulder', 'Bell Sleeve', 'Puff Sleeve'],
                placeholder: 'Select sleeve type'
            },
            {
                name: 'neck_type',
                label: 'Neck Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Round Neck', 'V-Neck', 'Boat Neck', 'Collar Neck', 'Mandarin Collar', 'Sweetheart', 'Square Neck', 'Off Shoulder', 'Keyhole', 'Halter'],
                placeholder: 'Select neck type'
            },
            {
                name: 'work_type',
                label: 'Work/Embellishment',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Embroidery', 'Printed', 'Sequin', 'Stone Work', 'Thread Work', 'Mirror Work', 'Plain', 'Lace', 'Applique', 'Gota Patti', 'Other'],
                placeholder: 'Select work type'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Casual', 'Party', 'Festive', 'Wedding', 'Office Wear', 'Daily Wear', 'Ethnic', 'Formal'],
                placeholder: 'Select occasion'
            },
            {
                name: 'pattern',
                label: 'Pattern',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Solid', 'Printed', 'Floral', 'Geometric', 'Striped', 'Checked', 'Abstract', 'Traditional', 'Paisley'],
                placeholder: 'Select pattern'
            },
            {
                name: 'color',
                label: 'Primary Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Red, Blue, Multi'
            },
            {
                name: 'set_includes',
                label: 'Set Includes (if applicable)',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Kurti + Dupatta + Palazzo'
            },
            {
                name: 'wash_care',
                label: 'Wash Care',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Machine Wash', 'Hand Wash', 'Dry Clean Only', 'Dry Clean Recommended'],
                default: 'Hand Wash'
            }
        ]
    },

    // ==================== MUGS ====================
    'mugs': {
        label: 'Mugs & Cups',
        keywords: ['mug', 'mugs', 'cup', 'cups', 'coffee mug', 'tea mug'],
        fields: [
            {
                name: 'mug_type',
                label: 'Mug Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Coffee Mug', 'Tea Cup', 'Travel Mug', 'Beer Mug', 'Couple Mug Set', 'Magic Mug', 'Personalized Mug', 'Kids Mug', 'Thermos', 'Insulated', 'Other'],
                placeholder: 'Select mug type'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Ceramic', 'Porcelain', 'Glass', 'Stainless Steel', 'Bone China', 'Earthenware', 'Bamboo', 'Plastic (BPA Free)', 'Copper', 'Clay', 'Other'],
                placeholder: 'Select material'
            },
            {
                name: 'capacity',
                label: 'Capacity',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['100ml', '150ml', '200ml', '250ml', '300ml', '350ml', '400ml', '450ml', '500ml', '600ml', 'Other'],
                placeholder: 'Select capacity'
            },
            {
                name: 'set_quantity',
                label: 'Quantity in Set',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1', '2', '4', '6', '12'],
                default: '1'
            },
            {
                name: 'design_theme',
                label: 'Design/Theme',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Tribal art, Quotes, Floral'
            },
            {
                name: 'personalization',
                label: 'Personalization Available',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'handmade',
                label: 'Handmade/Hand-painted',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'microwave_safe',
                label: 'Microwave Safe',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'dishwasher_safe',
                label: 'Dishwasher Safe',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== FLOWERS ====================
    'flowers': {
        label: 'Flowers',
        keywords: ['flower', 'flowers', 'bouquet', 'floral', 'rose', 'arrangement'],
        fields: [
            {
                name: 'flower_type',
                label: 'Flower Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Roses', 'Lilies', 'Orchids', 'Carnations', 'Tulips', 'Sunflowers', 'Gerberas', 'Mixed Flowers', 'Exotic', 'Seasonal', 'Artificial', 'Dried/Preserved', 'Other'],
                placeholder: 'Select flower type'
            },
            {
                name: 'arrangement_type',
                label: 'Arrangement Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Bouquet', 'Basket', 'Vase Arrangement', 'Box', 'Heart Shape', 'Wreath', 'Garland', 'Single Stem', 'Hand Tied', 'Other'],
                placeholder: 'Select arrangement'
            },
            {
                name: 'quantity',
                label: 'Number of Stems',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1', '6', '12', '24', '50', '100', 'Mixed'],
                placeholder: 'Select quantity'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Red', 'Pink', 'White', 'Yellow', 'Orange', 'Purple', 'Mixed', 'Custom'],
                placeholder: 'Select color'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Birthday', 'Anniversary', 'Valentine', 'Wedding', 'Sympathy', 'Get Well', 'Thank You', 'Congratulations', 'Just Because', 'Any Occasion'],
                placeholder: 'Select occasion'
            },
            {
                name: 'freshness_guarantee',
                label: 'Freshness Guarantee',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['3 Days', '5 Days', '7 Days', '10 Days', '14 Days', 'N/A (Artificial)'],
                placeholder: 'Select guarantee'
            },
            {
                name: 'add_ons',
                label: 'Add-ons Included',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Chocolates, Teddy, Card'
            },
            {
                name: 'same_day_delivery',
                label: 'Same Day Delivery',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            },
            {
                name: 'is_artificial',
                label: 'Is Artificial',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== CAR ACCESSORIES ====================
    'car_accessories': {
        label: 'Car Accessories',
        keywords: ['car', 'automobile', 'vehicle', 'auto', 'car accessories'],
        fields: [
            {
                name: 'accessory_type',
                label: 'Accessory Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Seat Cover', 'Floor Mat', 'Steering Cover', 'Dashboard Accessories', 'Car Perfume', 'Mobile Holder', 'Charger', 'Organizer', 'Sun Shade', 'Lights', 'Cleaning Kit', 'Tool Kit', 'Music System', 'Camera', 'Other'],
                placeholder: 'Select accessory type'
            },
            {
                name: 'car_compatibility',
                label: 'Car Compatibility',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Universal', 'Sedan', 'SUV', 'Hatchback', 'MPV', 'Specific Model'],
                placeholder: 'Select compatibility'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Leather', 'Faux Leather', 'Fabric', 'Rubber', 'Plastic', 'Silicone', 'Metal', 'Carbon Fiber', 'Wood', 'Other'],
                placeholder: 'Select material'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Black, Beige, Brown'
            },
            {
                name: 'set_includes',
                label: 'Set Includes',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 5 pieces, Front + Rear'
            },
            {
                name: 'installation_type',
                label: 'Installation Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Easy DIY', 'Professional Required', 'No Installation'],
                default: 'Easy DIY'
            },
            {
                name: 'warranty',
                label: 'Warranty',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['No Warranty', '6 Months', '1 Year', '2 Years', 'Lifetime'],
                placeholder: 'Select warranty'
            }
        ]
    },

    // ==================== HOUSEHOLD APPLIANCES ====================
    'household_appliances': {
        label: 'Household Appliances',
        keywords: ['household', 'home appliance', 'appliance', 'household appliances'],
        fields: [
            {
                name: 'appliance_type',
                label: 'Appliance Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Mixer Grinder', 'Blender', 'Juicer', 'Food Processor', 'Water Purifier', 'Vacuum Cleaner', 'Iron', 'Fan', 'Heater', 'Air Purifier', 'Sewing Machine', 'Other'],
                placeholder: 'Select appliance type'
            },
            {
                name: 'brand',
                label: 'Brand',
                type: FIELD_TYPES.TEXT,
                required: true,
                placeholder: 'Enter brand name'
            },
            {
                name: 'model_number',
                label: 'Model Number',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Enter model number'
            },
            {
                name: 'power_watts',
                label: 'Power Consumption (Watts)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 750'
            },
            {
                name: 'voltage',
                label: 'Voltage',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['220-240V', '110-120V', 'Universal'],
                default: '220-240V'
            },
            {
                name: 'capacity_size',
                label: 'Capacity/Size',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 1.5L, 4 Jars'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Black, White, Silver'
            },
            {
                name: 'features',
                label: 'Key Features',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'List special features'
            },
            {
                name: 'warranty_years',
                label: 'Product Warranty',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1 Year', '2 Years', '3 Years', '5 Years', 'No Warranty'],
                default: '1 Year'
            },
            {
                name: 'motor_warranty',
                label: 'Motor Warranty (if applicable)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['2 Years', '3 Years', '5 Years', '10 Years', 'Lifetime', 'N/A'],
                default: 'N/A'
            },
            {
                name: 'isi_certified',
                label: 'ISI/BIS Certified',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== ELECTRICAL APPLIANCES ====================
    'electrical_appliances': {
        label: 'Electrical Appliances',
        keywords: ['electrical', 'electric', 'electronic', 'electronics', 'electrical appliances'],
        fields: [
            {
                name: 'appliance_type',
                label: 'Appliance Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['TV', 'Refrigerator', 'Washing Machine', 'AC', 'Microwave', 'Oven', 'Geyser', 'Inverter', 'UPS', 'Fan', 'Cooler', 'LED Bulb', 'Tube Light', 'Laptop', 'Mobile Phone', 'Speaker', 'Other'],
                placeholder: 'Select appliance type'
            },
            {
                name: 'brand',
                label: 'Brand',
                type: FIELD_TYPES.TEXT,
                required: true,
                placeholder: 'Enter brand name'
            },
            {
                name: 'model_number',
                label: 'Model Number',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Enter model number'
            },
            {
                name: 'power_watts',
                label: 'Power Consumption (Watts)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 1200'
            },
            {
                name: 'capacity_size',
                label: 'Capacity/Size',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 32 inch, 300L, 7 kg'
            },
            {
                name: 'energy_rating',
                label: 'Energy Star Rating',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['5 Star', '4 Star', '3 Star', '2 Star', '1 Star', 'Not Rated'],
                placeholder: 'Select rating'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Black, White, Silver'
            },
            {
                name: 'features',
                label: 'Key Features',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'List special features'
            },
            {
                name: 'warranty_years',
                label: 'Product Warranty',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1 Year', '2 Years', '3 Years', '5 Years', 'No Warranty'],
                default: '1 Year'
            },
            {
                name: 'installation',
                label: 'Installation',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Free Installation', 'Paid Installation', 'Self Installation', 'Not Required'],
                placeholder: 'Select installation'
            },
            {
                name: 'isi_certified',
                label: 'ISI/BIS Certified',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    },

    // ==================== KIDS ====================
    'kids': {
        label: 'Kids Products',
        keywords: ['kids', 'kid', 'children', 'child', 'baby', 'toddler', 'infant'],
        fields: [
            {
                name: 'product_type',
                label: 'Product Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Clothing', 'Toy', 'Book', 'School Supplies', 'Footwear', 'Accessories', 'Baby Care', 'Feeding', 'Nursery', 'Gift Set', 'Educational', 'Games', 'Other'],
                placeholder: 'Select product type'
            },
            {
                name: 'age_group',
                label: 'Age Group',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['0-6 months', '6-12 months', '1-2 years', '2-4 years', '4-6 years', '6-8 years', '8-10 years', '10-12 years', '12+ years', 'All Ages'],
                placeholder: 'Select age group'
            },
            {
                name: 'gender',
                label: 'Gender',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Boys', 'Girls', 'Unisex'],
                default: 'Unisex'
            },
            {
                name: 'size',
                label: 'Size (if applicable)',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 2-3 years, 18 inches'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Cotton, Plastic, Wood'
            },
            {
                name: 'safety_certified',
                label: 'Safety Certified',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes (BIS)', 'Yes (CE)', 'Yes (ASTM)', 'No', 'Not Required'],
                placeholder: 'Select certification'
            },
            {
                name: 'theme',
                label: 'Theme/Character',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Cartoon, Superhero, Princess'
            },
            {
                name: 'educational_value',
                label: 'Educational Value',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Motor skills, Learning alphabet'
            },
            {
                name: 'wash_care',
                label: 'Wash/Care Instructions',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Care instructions'
            }
        ]
    },

    // ==================== ANNIVERSARY GIFTS ====================
    'anniversary_gifts': {
        label: 'Anniversary Gifts',
        keywords: ['anniversary', 'gift', 'gifts', 'anniversary gifts', 'couple', 'love'],
        fields: [
            {
                name: 'gift_type',
                label: 'Gift Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Photo Frame', 'Personalized Gift', 'Couple Gift Set', 'Jewelry', 'Home Decor', 'Flowers', 'Cake', 'Hamper', 'Experience Gift', 'Customized Item', 'Watch', 'Perfume', 'Other'],
                placeholder: 'Select gift type'
            },
            {
                name: 'anniversary_year',
                label: 'Anniversary Year (if specific)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1st', '5th', '10th', '25th (Silver)', '50th (Golden)', 'Any Anniversary'],
                placeholder: 'Select year'
            },
            {
                name: 'personalization',
                label: 'Personalization Available',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes - Name/Text', 'Yes - Photo', 'Yes - Both', 'No'],
                default: 'No'
            },
            {
                name: 'recipient',
                label: 'For',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Husband', 'Wife', 'Couple', 'Parents', 'Grandparents', 'Friends', 'Anyone'],
                placeholder: 'Select recipient'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Wood, Metal, Crystal'
            },
            {
                name: 'size_dimensions',
                label: 'Size/Dimensions',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 8x10 inches'
            },
            {
                name: 'gift_wrapping',
                label: 'Gift Wrapping Available',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes - Free', 'Yes - Paid', 'No'],
                default: 'Yes - Free'
            },
            {
                name: 'message_card',
                label: 'Message Card Included',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'Yes'
            }
        ]
    },

    // ==================== DEFAULT (FALLBACK) ====================
    'default': {
        label: 'General Product',
        keywords: [],
        fields: [
            {
                name: 'product_type',
                label: 'Product Type',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Describe the product type'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Primary material used'
            },
            {
                name: 'dimensions',
                label: 'Dimensions',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 20cm x 15cm x 10cm'
            },
            {
                name: 'weight',
                label: 'Weight',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 500g, 1kg'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Primary color'
            },
            {
                name: 'handmade',
                label: 'Handmade',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            }
        ]
    }
};

/**
 * Get attributes configuration for a given category name
 * Matches against exact keys, keywords, and display names
 */
export const getAttributesForCategory = (categoryName) => {
    if (!categoryName) {
        return CATEGORY_ATTRIBUTES['default'];
    }

    const searchName = categoryName.toLowerCase().trim();

    // Step 1: Try exact key match
    if (CATEGORY_ATTRIBUTES[searchName]) {
        return CATEGORY_ATTRIBUTES[searchName];
    }

    // Step 2: Try exact label match (case-insensitive)
    for (const [key, config] of Object.entries(CATEGORY_ATTRIBUTES)) {
        if (config.label && config.label.toLowerCase() === searchName) {
            return config;
        }
    }

    // Step 3: Try keyword matching
    for (const [key, config] of Object.entries(CATEGORY_ATTRIBUTES)) {
        if (config.keywords && config.keywords.length > 0) {
            for (const keyword of config.keywords) {
                if (searchName.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(searchName)) {
                    return config;
                }
            }
        }
    }

    // Step 4: Common term mapping
    const categoryMapping = {
        'bamboo and canes': 'bamboo_canes',
        'bamboo': 'bamboo_canes',
        'handcrafted teawares': 'handcrafted_teawares',
        'teawares': 'handcrafted_teawares',
        'tripura jewellery': 'tripura_jewellery',
        'jewellery': 'tripura_jewellery',
        'jewelry': 'tripura_jewellery',
        'women wear': 'women_wear',
        'ladies': 'women_wear',
        'womens': 'women_wear',
        'banarasi saree': 'banarasi_saree',
        'banarasi': 'banarasi_saree',
        'household appliances': 'household_appliances',
        'electrical appliances': 'electrical_appliances',
        'anniversary gifts': 'anniversary_gifts',
        'car accessories': 'car_accessories',
        'kitchen appliances': 'kitchen_appliances',
        'mixer grinder': 'household_appliances',
        'grinder': 'household_appliances',
    };

    if (categoryMapping[searchName]) {
        return CATEGORY_ATTRIBUTES[categoryMapping[searchName]];
    }

    // Step 5: Partial match on category mapping keys
    for (const [mappedName, categoryKey] of Object.entries(categoryMapping)) {
        if (searchName.includes(mappedName) || mappedName.includes(searchName)) {
            return CATEGORY_ATTRIBUTES[categoryKey];
        }
    }

    // Default fallback
    return CATEGORY_ATTRIBUTES['default'];
};

export default CATEGORY_ATTRIBUTES;
