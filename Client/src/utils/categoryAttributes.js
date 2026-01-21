/**
 * Category-specific product attributes configuration
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

// Category-specific attributes
export const CATEGORY_ATTRIBUTES = {
    // Handcrafted Teawares
    'handcrafted_teawares': {
        label: 'Handcrafted Teawares',
        keywords: ['teaware', 'tea', 'teapot', 'cup', 'kettle', 'handcrafted tea'],
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
                options: ['Ceramic', 'Porcelain', 'Clay', 'Terracotta', 'Bone China', 'Glass', 'Bamboo', 'Wood', 'Metal', 'Other'],
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

    // Bamboo and Canes
    'bamboo_canes': {
        label: 'Bamboo & Cane Products',
        keywords: ['bamboo', 'cane', 'canes', 'rattan', 'wicker'],
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

    // Cakes
    'cakes': {
        label: 'Cakes & Bakery',
        keywords: ['cake', 'cakes', 'bakery', 'pastry', 'dessert', 'sweet'],
        fields: [
            {
                name: 'cake_type',
                label: 'Cake Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Birthday Cake', 'Wedding Cake', 'Anniversary Cake', 'Chocolate Cake', 'Fruit Cake', 'Black Forest', 'Red Velvet', 'Cheesecake', 'Cupcakes', 'Pastries', 'Custom Cake', 'Eggless Cake', 'Other'],
                placeholder: 'Select cake type'
            },
            {
                name: 'flavor',
                label: 'Flavor',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Chocolate', 'Vanilla', 'Strawberry', 'Butterscotch', 'Pineapple', 'Mango', 'Coffee', 'Blueberry', 'Mixed Fruit', 'Custom', 'Other'],
                placeholder: 'Select flavor'
            },
            {
                name: 'weight_kg',
                label: 'Weight (kg)',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['0.5 kg', '1 kg', '1.5 kg', '2 kg', '2.5 kg', '3 kg', '4 kg', '5 kg', 'Custom'],
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
                options: ['Round', 'Square', 'Rectangle', 'Heart', 'Custom Shape', 'Tier'],
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
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 24'
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
            }
        ]
    },

    // Sarees
    'sarees': {
        label: 'Sarees',
        keywords: ['saree', 'sarees', 'sari', 'saris'],
        fields: [
            {
                name: 'saree_type',
                label: 'Saree Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Silk Saree', 'Cotton Saree', 'Georgette', 'Chiffon', 'Crepe', 'Organza', 'Linen', 'Khadi', 'Handloom', 'Designer', 'Printed', 'Embroidered', 'Other'],
                placeholder: 'Select saree type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pure Silk', 'Art Silk', 'Cotton', 'Cotton Silk', 'Georgette', 'Chiffon', 'Crepe', 'Organza', 'Linen', 'Khadi', 'Net', 'Satin', 'Velvet', 'Other'],
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
                label: 'Blouse Piece Length (meters)',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 0.8 meters'
            },
            {
                name: 'work_type',
                label: 'Work/Embellishment Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Zari Work', 'Embroidery', 'Printed', 'Sequin', 'Stone Work', 'Thread Work', 'Mirror Work', 'Plain', 'Digital Print', 'Hand Painted', 'Other'],
                placeholder: 'Select work type'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Casual', 'Party', 'Wedding', 'Festival', 'Office Wear', 'Daily Wear', 'Special Occasion'],
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
            }
        ]
    },

    // Banarasi Saree (specific subcategory)
    'banarasi_saree': {
        label: 'Banarasi Saree',
        keywords: ['banarasi', 'banaras', 'varanasi'],
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
                options: ['Jangla', 'Tanchoi', 'Butidar', 'Cutwork', 'Jaal', 'Shikargah', 'Kadwa'],
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
                options: ['Bridal', 'Wedding', 'Party', 'Festival', 'Special Occasion'],
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

    // Shawls
    'shawls': {
        label: 'Shawls',
        keywords: ['shawl', 'shawls', 'stole', 'wrap', 'dupatta'],
        fields: [
            {
                name: 'shawl_type',
                label: 'Shawl Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pashmina', 'Cashmere', 'Wool', 'Silk', 'Cotton', 'Handloom', 'Embroidered', 'Printed', 'Stole', 'Dupatta', 'Other'],
                placeholder: 'Select shawl type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Pure Wool', 'Pashmina', 'Cashmere', 'Silk', 'Silk Wool', 'Cotton', 'Acrylic', 'Blended'],
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
                options: ['Sozni Embroidery', 'Aari Work', 'Kani Weave', 'Printed', 'Plain', 'Machine Embroidery', 'Hand Embroidery', 'Other'],
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

    // Tripura Jewellery
    'tripura_jewellery': {
        label: 'Tripura Jewellery',
        keywords: ['tripura', 'jewellery', 'jewelry', 'tribal', 'ornament'],
        fields: [
            {
                name: 'jewellery_type',
                label: 'Jewellery Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Necklace', 'Earrings', 'Bangles', 'Bracelet', 'Anklet', 'Ring', 'Nose Pin', 'Hair Accessory', 'Pendant', 'Complete Set', 'Other'],
                placeholder: 'Select jewellery type'
            },
            {
                name: 'material',
                label: 'Primary Material',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Silver', 'German Silver', 'Brass', 'Copper', 'Alloy', 'Beads', 'Wood', 'Bamboo', 'Shell', 'Bone', 'Mixed'],
                placeholder: 'Select material'
            },
            {
                name: 'tribal_design',
                label: 'Tribal/Traditional Design',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Traditional Tripuri', 'Chakma', 'Reang', 'Jamatia', 'Tribal Fusion', 'Contemporary', 'Other'],
                placeholder: 'Select design style'
            },
            {
                name: 'plating',
                label: 'Plating/Finish',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Gold Plated', 'Silver Plated', 'Oxidized', 'Antique Finish', 'Natural', 'Rhodium Plated'],
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
                placeholder: 'e.g., 18 inches length, 2.5 inches diameter'
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
                options: ['Daily Wear', 'Festival', 'Wedding', 'Party', 'Traditional Event', 'Gift'],
                placeholder: 'Select occasion'
            },
            {
                name: 'gender',
                label: 'Gender',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Women', 'Men', 'Unisex', 'Girls', 'Boys'],
                default: 'Women'
            }
        ]
    },

    // Women Wear
    'women_wear': {
        label: 'Women Wear',
        keywords: ['women', 'woman', 'ladies', 'female', 'wear', 'dress', 'kurti', 'suit'],
        fields: [
            {
                name: 'garment_type',
                label: 'Garment Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Kurti', 'Salwar Suit', 'Dress', 'Top', 'Blouse', 'Palazzo', 'Lehenga', 'Gown', 'Tunic', 'Indo-Western', 'Skirt', 'Ethnic Set', 'Other'],
                placeholder: 'Select garment type'
            },
            {
                name: 'fabric',
                label: 'Fabric',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Crepe', 'Rayon', 'Linen', 'Khadi', 'Velvet', 'Net', 'Satin', 'Polyester', 'Blended'],
                placeholder: 'Select fabric'
            },
            {
                name: 'size',
                label: 'Available Sizes',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', 'Custom Size', 'S/M/L/XL', 'All Sizes Available'],
                placeholder: 'Select sizes'
            },
            {
                name: 'length',
                label: 'Length',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Short', 'Knee Length', 'Calf Length', 'Ankle Length', 'Floor Length'],
                placeholder: 'Select length'
            },
            {
                name: 'sleeve_type',
                label: 'Sleeve Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Sleeveless', 'Half Sleeve', 'Three-Quarter Sleeve', 'Full Sleeve', 'Cap Sleeve', 'Cold Shoulder'],
                placeholder: 'Select sleeve type'
            },
            {
                name: 'neck_type',
                label: 'Neck Type',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Round Neck', 'V-Neck', 'Boat Neck', 'Collar Neck', 'Mandarin Collar', 'Sweetheart', 'Square Neck', 'Off Shoulder'],
                placeholder: 'Select neck type'
            },
            {
                name: 'work_type',
                label: 'Work/Embellishment',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Embroidery', 'Printed', 'Sequin', 'Stone Work', 'Thread Work', 'Mirror Work', 'Plain', 'Lace', 'Other'],
                placeholder: 'Select work type'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Casual', 'Party', 'Festive', 'Wedding', 'Office Wear', 'Daily Wear', 'Ethnic'],
                placeholder: 'Select occasion'
            },
            {
                name: 'pattern',
                label: 'Pattern',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Solid', 'Printed', 'Floral', 'Geometric', 'Striped', 'Checked', 'Abstract', 'Traditional'],
                placeholder: 'Select pattern'
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

    // Mugs
    'mugs': {
        label: 'Mugs & Cups',
        keywords: ['mug', 'mugs', 'cup', 'cups', 'coffee mug', 'tea mug'],
        fields: [
            {
                name: 'mug_type',
                label: 'Mug Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Coffee Mug', 'Tea Cup', 'Travel Mug', 'Beer Mug', 'Couple Mug Set', 'Magic Mug', 'Personalized Mug', 'Kids Mug', 'Other'],
                placeholder: 'Select mug type'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Ceramic', 'Porcelain', 'Glass', 'Stainless Steel', 'Bone China', 'Earthenware', 'Bamboo', 'Plastic (BPA Free)', 'Other'],
                placeholder: 'Select material'
            },
            {
                name: 'capacity',
                label: 'Capacity (ml)',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['150ml', '200ml', '250ml', '300ml', '350ml', '400ml', '450ml', '500ml', 'Other'],
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

    // Flowers
    'flowers': {
        label: 'Flowers & Plants',
        keywords: ['flower', 'flowers', 'plant', 'plants', 'bouquet', 'floral'],
        fields: [
            {
                name: 'product_type',
                label: 'Product Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Fresh Bouquet', 'Single Flower', 'Flower Bunch', 'Artificial Flowers', 'Indoor Plant', 'Outdoor Plant', 'Succulent', 'Flowering Plant', 'Decorative Plant', 'Seeds', 'Gift Hamper', 'Other'],
                placeholder: 'Select product type'
            },
            {
                name: 'flower_type',
                label: 'Flower/Plant Name',
                type: FIELD_TYPES.TEXT,
                required: true,
                placeholder: 'e.g., Rose, Lily, Orchid, Money Plant'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Red, Yellow, Mixed'
            },
            {
                name: 'quantity',
                label: 'Quantity (stems/plants)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 12'
            },
            {
                name: 'freshness_guarantee',
                label: 'Freshness Guarantee (days)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 5'
            },
            {
                name: 'occasion',
                label: 'Occasion',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Birthday', 'Anniversary', 'Wedding', 'Congratulations', 'Get Well', 'Thank You', 'Love', 'Sympathy', 'Festival', 'Home Decor', 'General'],
                placeholder: 'Select occasion'
            },
            {
                name: 'vase_included',
                label: 'Vase/Pot Included',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'care_level',
                label: 'Care Level (for plants)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Easy', 'Moderate', 'Expert', 'N/A'],
                default: 'N/A'
            },
            {
                name: 'sunlight_requirement',
                label: 'Sunlight Requirement',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Full Sun', 'Partial Sun', 'Low Light', 'Indirect Light', 'N/A'],
                default: 'N/A'
            },
            {
                name: 'fragrance',
                label: 'Fragrance',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Highly Fragrant', 'Mildly Fragrant', 'No Fragrance'],
                placeholder: 'Select fragrance level'
            },
            {
                name: 'delivery_instructions',
                label: 'Special Delivery Instructions',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'Delivery timing, handling requirements, etc.'
            }
        ]
    },

    // Car Accessories
    'car_accessories': {
        label: 'Car Accessories',
        keywords: ['car', 'auto', 'vehicle', 'automobile', 'accessories', 'automotive'],
        fields: [
            {
                name: 'accessory_type',
                label: 'Accessory Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Seat Cover', 'Floor Mat', 'Dashboard Accessory', 'Air Freshener', 'Phone Holder', 'Charger', 'Sun Shade', 'Steering Cover', 'Cushion', 'Organizer', 'Cleaning Product', 'Light/LED', 'Mirror', 'Cover', 'Other'],
                placeholder: 'Select accessory type'
            },
            {
                name: 'material',
                label: 'Material',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Leather', 'Faux Leather', 'Fabric', 'Rubber', 'Plastic', 'Silicone', 'Metal', 'Wood', 'Foam', 'Other'],
                placeholder: 'Select material'
            },
            {
                name: 'car_compatibility',
                label: 'Car Compatibility',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Universal Fit', 'Sedan', 'Hatchback', 'SUV', 'MUV', 'Specific Model'],
                default: 'Universal Fit'
            },
            {
                name: 'specific_model',
                label: 'Specific Car Model (if applicable)',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Maruti Swift, Hyundai Creta'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Black, Beige, Grey'
            },
            {
                name: 'set_includes',
                label: 'Set Includes',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., Front + Rear Mats, 5 Seat Covers'
            },
            {
                name: 'installation',
                label: 'Installation',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Easy Self-Install', 'Professional Required', 'No Installation Needed'],
                default: 'Easy Self-Install'
            },
            {
                name: 'warranty',
                label: 'Warranty (months)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 6'
            }
        ]
    },

    // Household Appliances
    'household_appliances': {
        label: 'Household Appliances',
        keywords: ['household', 'home', 'appliance', 'appliances', 'kitchen', 'domestic'],
        fields: [
            {
                name: 'appliance_type',
                label: 'Appliance Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Mixer Grinder', 'Juicer', 'Blender', 'Toaster', 'Iron', 'Vacuum Cleaner', 'Fan', 'Heater', 'Cooker', 'Water Purifier', 'Air Purifier', 'Humidifier', 'Other'],
                placeholder: 'Select appliance type'
            },
            {
                name: 'power_watts',
                label: 'Power (Watts)',
                type: FIELD_TYPES.NUMBER,
                required: false,
                placeholder: 'e.g., 750'
            },
            {
                name: 'voltage',
                label: 'Voltage',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['220-240V', '110-120V', 'Multi-Voltage'],
                default: '220-240V'
            },
            {
                name: 'capacity',
                label: 'Capacity/Size',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., 3 Liters, 5 kg'
            },
            {
                name: 'color',
                label: 'Color',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'e.g., White, Black, Silver'
            },
            {
                name: 'features',
                label: 'Key Features',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'List key features, e.g., 3 speed settings, auto shut-off'
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
                name: 'warranty_years',
                label: 'Warranty (years)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['1 Year', '2 Years', '3 Years', '5 Years', 'No Warranty'],
                default: '1 Year'
            },
            {
                name: 'motor_warranty',
                label: 'Motor Warranty (years)',
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

    // Electrical Appliances
    'electrical_appliances': {
        label: 'Electrical Appliances',
        keywords: ['electrical', 'electric', 'electronic', 'electronics', 'appliance'],
        fields: [
            {
                name: 'appliance_type',
                label: 'Appliance Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['TV', 'Refrigerator', 'Washing Machine', 'AC', 'Microwave', 'Oven', 'Geyser', 'Inverter', 'UPS', 'Fan', 'Cooler', 'LED Bulb', 'Tube Light', 'Other'],
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
                label: 'Product Warranty (years)',
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

    // Kids
    'kids': {
        label: 'Kids Products',
        keywords: ['kids', 'kid', 'children', 'child', 'baby', 'toddler', 'infant'],
        fields: [
            {
                name: 'product_type',
                label: 'Product Type',
                type: FIELD_TYPES.SELECT,
                required: true,
                options: ['Clothing', 'Toy', 'Book', 'School Supplies', 'Footwear', 'Accessories', 'Baby Care', 'Feeding', 'Nursery', 'Gift Set', 'Educational', 'Other'],
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
                placeholder: 'e.g., 2-3 years, 24 inches'
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
                options: ['Yes (ISI)', 'Yes (BIS)', 'Yes (International)', 'Not Certified'],
                placeholder: 'Select certification'
            },
            {
                name: 'bpa_free',
                label: 'BPA Free (for feeding/toys)',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No', 'N/A'],
                default: 'N/A'
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

    // Default fallback for unmatched categories
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
                placeholder: 'Product color'
            },
            {
                name: 'occasion',
                label: 'Occasion/Use',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'When/where to use this product'
            },
            {
                name: 'handmade',
                label: 'Handmade',
                type: FIELD_TYPES.SELECT,
                required: false,
                options: ['Yes', 'No'],
                default: 'No'
            },
            {
                name: 'warranty',
                label: 'Warranty',
                type: FIELD_TYPES.TEXT,
                required: false,
                placeholder: 'Warranty period if applicable'
            },
            {
                name: 'special_features',
                label: 'Special Features',
                type: FIELD_TYPES.TEXTAREA,
                required: false,
                placeholder: 'Any special features or highlights'
            }
        ]
    }
};

/**
 * Get attributes for a given category
 * @param {string} categoryName - The category name from the product
 * @returns {object} - The matching category attributes or default
 */
export const getAttributesForCategory = (categoryName) => {
    if (!categoryName) return CATEGORY_ATTRIBUTES.default;

    const normalizedName = categoryName.toLowerCase().trim();

    // Direct match first
    const directMatch = Object.keys(CATEGORY_ATTRIBUTES).find(key =>
        normalizedName === key.replace(/_/g, ' ') ||
        normalizedName.replace(/\s+/g, '_') === key ||
        normalizedName.replace(/\s+/g, '') === key.replace(/_/g, '')
    );

    if (directMatch) {
        return CATEGORY_ATTRIBUTES[directMatch];
    }

    // Keyword matching
    for (const [key, config] of Object.entries(CATEGORY_ATTRIBUTES)) {
        if (key === 'default') continue;

        const keywords = config.keywords || [];
        const matchesKeyword = keywords.some(keyword =>
            normalizedName.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(normalizedName)
        );

        if (matchesKeyword) {
            return config;
        }
    }

    // Check if category name contains any key category terms
    const categoryMappings = {
        'teaware': 'handcrafted_teawares',
        'bamboo': 'bamboo_canes',
        'cane': 'bamboo_canes',
        'cake': 'cakes',
        'saree': 'sarees',
        'sari': 'sarees',
        'banarasi': 'banarasi_saree',
        'banaras': 'banarasi_saree',
        'shawl': 'shawls',
        'stole': 'shawls',
        'jewel': 'tripura_jewellery',
        'tripura': 'tripura_jewellery',
        'women': 'women_wear',
        'ladies': 'women_wear',
        'kurti': 'women_wear',
        'dress': 'women_wear',
        'mug': 'mugs',
        'cup': 'mugs',
        'flower': 'flowers',
        'plant': 'flowers',
        'bouquet': 'flowers',
        'car': 'car_accessories',
        'auto': 'car_accessories',
        'vehicle': 'car_accessories',
        'household': 'household_appliances',
        'home appliance': 'household_appliances',
        'kitchen': 'household_appliances',
        'electrical': 'electrical_appliances',
        'electronic': 'electrical_appliances',
        'electric': 'electrical_appliances',
        'kid': 'kids',
        'child': 'kids',
        'baby': 'kids',
        'toy': 'kids'
    };

    for (const [term, categoryKey] of Object.entries(categoryMappings)) {
        if (normalizedName.includes(term)) {
            return CATEGORY_ATTRIBUTES[categoryKey];
        }
    }

    return CATEGORY_ATTRIBUTES.default;
};

/**
 * Get all available category configurations
 * @returns {object} - All category attributes
 */
export const getAllCategories = () => CATEGORY_ATTRIBUTES;

/**
 * Get common fields
 * @returns {array} - Common fields for all products
 */
export const getCommonFields = () => COMMON_FIELDS;
