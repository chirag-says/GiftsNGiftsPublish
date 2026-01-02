/**
 * Zod Validation Schemas - Enterprise Security Module
 * 
 * OWASP Compliance:
 * - Input validation for all API endpoints
 * - Type coercion and sanitization
 * - Prevents injection attacks (SQL, NoSQL, XSS)
 */
import { z } from 'zod';

// ============ COMMON SCHEMAS ============

// MongoDB ObjectId pattern
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

// Email validation with normalization
const emailSchema = z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long');

// Password validation with strength requirements
const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

// Phone validation (Indian format)
const phoneSchema = z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number format')
    .optional();

// Sanitized text (prevents XSS by stripping dangerous characters)
const sanitizedTextSchema = z.string()
    .transform(val => val.replace(/<[^>]*>/g, '').trim());

// Price validation
const priceSchema = z.number()
    .positive('Price must be positive')
    .max(10000000, 'Price exceeds maximum limit');

// ============ AUTH SCHEMAS ============

export const registerUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name too short').max(100, 'Name too long').trim(),
        email: emailSchema,
        password: passwordSchema
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password required').max(128)
    })
});

export const registerSellerSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).trim(),
        email: emailSchema,
        password: passwordSchema,
        nickName: z.string().min(2).max(100).trim(),
        phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
        street: z.string().min(1).max(200).trim(),
        city: z.string().min(1).max(100).trim(),
        state: z.string().min(1).max(100).trim(),
        pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
        region: z.string().optional()
    })
});

export const otpSchema = z.object({
    body: z.object({
        email: emailSchema,
        otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits')
    })
});

// ============ PRODUCT SCHEMAS ============

export const productIdParamSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});

export const createProductSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title too short').max(200, 'Title too long').trim(),
        description: z.string().min(10, 'Description too short').max(5000, 'Description too long').trim(),
        price: z.coerce.number().positive().max(10000000),
        categoryname: objectIdSchema,
        subcategory: objectIdSchema,
        oldprice: z.coerce.number().positive().optional(),
        discount: z.coerce.number().min(0).max(99).optional(),
        stock: z.coerce.number().int().min(0).max(1000000).default(0),
        brand: z.string().max(100).optional(),
        size: z.string().max(50).optional(),
        ingredients: z.string().max(2000).optional(),
        additional_details: z.string().max(2000).optional(),
        // Product specifications
        productDimensions: z.string().max(100).optional(),
        itemWeight: z.string().max(50).optional(),
        itemDimensionsLxWxH: z.string().max(100).optional(),
        netQuantity: z.string().max(50).optional(),
        genericName: z.string().max(100).optional(),
        asin: z.string().max(20).optional(),
        itemPartNumber: z.string().max(50).optional(),
        dateFirstAvailable: z.string().optional(),
        bestSellerRank: z.string().max(100).optional(),
        materialComposition: z.string().max(200).optional(),
        outerMaterial: z.string().max(100).optional(),
        length: z.string().max(50).optional(),
        careInstructions: z.string().max(500).optional(),
        aboutThisItem: z.string().max(2000).optional(),
        manufacturer: z.string().max(200).optional(),
        packer: z.string().max(200).optional(),
        department: z.string().max(100).optional(),
        countryOfOrigin: z.string().max(100).optional()
    })
});

export const updateProductSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }),
    body: z.object({
        title: z.string().min(3).max(200).trim().optional(),
        description: z.string().min(10).max(5000).trim().optional(),
        price: z.coerce.number().positive().max(10000000).optional(),
        oldprice: z.coerce.number().positive().optional(),
        discount: z.coerce.number().min(0).max(99).optional(),
        stock: z.coerce.number().int().min(0).max(1000000).optional(),
        brand: z.string().max(100).optional(),
        size: z.string().max(50).optional()
    }).strict() // Reject unknown fields for mass assignment protection
});

// ============ CART/CHECKOUT SCHEMAS ============

export const addToCartSchema = z.object({
    body: z.object({
        productId: objectIdSchema,
        quantity: z.coerce.number().int().positive().max(100, 'Max 100 items per product')
    })
});

export const checkoutSchema = z.object({
    body: z.object({
        items: z.array(z.object({
            productId: objectIdSchema,
            quantity: z.coerce.number().int().positive().max(100)
        })).min(1, 'At least one item required').max(50, 'Max 50 items per order')
    })
});

// ============ PROFILE SCHEMAS ============

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).trim().optional(),
        phone: phoneSchema,
        email: emailSchema.optional()
        // Note: role, isBlocked, isAdmin are explicitly NOT allowed (mass assignment protection)
    }).strict()
});

export const addressSchema = z.object({
    body: z.object({
        address: z.object({
            name: z.string().min(2).max(100).trim(),
            phone: z.string().regex(/^[6-9]\d{9}$/),
            street: z.string().min(1).max(200).trim(),
            city: z.string().min(1).max(100).trim(),
            state: z.string().min(1).max(100).trim(),
            pincode: z.string().regex(/^\d{6}$/),
            isDefaultBilling: z.boolean().optional(),
            landmark: z.string().max(200).optional(),
            type: z.enum(['Home', 'Work', 'Other']).optional()
        })
    })
});

// ============ REVIEW SCHEMAS ============

export const createReviewSchema = z.object({
    body: z.object({
        productId: objectIdSchema,
        rating: z.coerce.number().int().min(1).max(5),
        comment: sanitizedTextSchema.max(2000).optional(),
        title: sanitizedTextSchema.max(200).optional(),
        userName: z.string().min(1).max(100).trim()
    })
});

// ============ ORDER SCHEMAS ============

export const orderIdParamSchema = z.object({
    params: z.object({
        orderId: objectIdSchema
    })
});

export const updateOrderStatusSchema = z.object({
    params: z.object({
        orderId: objectIdSchema
    }),
    body: z.object({
        status: z.enum(['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'])
    })
});

// ============ PAYMENT SCHEMAS ============

export const paymentVerificationSchema = z.object({
    body: z.object({
        razorpay_order_id: z.string().min(1).max(100),
        razorpay_payment_id: z.string().min(1).max(100),
        razorpay_signature: z.string().min(1).max(200)
    })
});

// ============ QUERY SCHEMAS ============

export const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sort: z.string().optional(),
        order: z.enum(['asc', 'desc']).optional()
    })
});

export const productFilterSchema = z.object({
    query: z.object({
        categoryname: z.string().optional(),
        minPrice: z.coerce.number().min(0).optional(),
        maxPrice: z.coerce.number().max(10000000).optional(),
        sort: z.enum(['asc', 'desc']).optional(),
        discount: z.coerce.number().min(0).max(99).optional(),
        search: z.string().max(100).optional()
    })
});

// ============ VALIDATION MIDDLEWARE ============

/**
 * Validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema) => async (req, res, next) => {
    try {
        const data = {
            body: req.body,
            params: req.params,
            query: req.query
        };

        const validated = await schema.parseAsync(data);

        // Replace request data with validated/sanitized data
        req.body = validated.body || req.body;
        req.params = validated.params || req.params;
        req.query = validated.query || req.query;

        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        // Log unexpected errors but don't expose details
        console.error('Validation error:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid request data'
        });
    }
};

/**
 * ObjectId param validator - commonly used
 */
export const validateId = (paramName = 'id') => async (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !objectIdSchema.safeParse(id).success) {
        return res.status(400).json({
            success: false,
            message: `Invalid ${paramName} format`
        });
    }
    next();
};

export default { validate, validateId };
