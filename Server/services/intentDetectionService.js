/**
 * Enhanced Intent Detection Service
 * Uses fuzzy matching, expanded keywords, stemming, and weighted scoring
 * No external AI APIs required - pure JavaScript NLP
 */

import * as fuzz from 'fuzzball';

// ============================================
// INTENT KEYWORD DICTIONARIES
// Each intent has multiple phrases that can trigger it
// ============================================

const INTENT_PATTERNS = {
    // ORDER TRACKING
    'order.status': {
        weight: 10,
        phrases: [
            'track my order', 'track order', 'where is my order', 'order status',
            'delivery status', 'shipping status', 'package status', 'shipment status',
            'where is my package', 'where is my parcel', 'where is my delivery',
            'when will i get', 'when will it arrive', 'when will my order come',
            'expected delivery', 'delivery date', 'delivery time', 'eta',
            'has it shipped', 'is it shipped', 'did it ship', 'shipped yet',
            'out for delivery', 'in transit', 'on the way',
            'check my order', 'show my order', 'my orders', 'view orders',
            'order update', 'any update', 'status update',
            'tracking number', 'tracking info', 'tracking details',
            'where is my stuff', 'wheres my order', 'order kahan hai',
            'mera order', 'delivery kab', 'parcel kab aayega'
        ],
        keywords: ['track', 'status', 'where', 'delivery', 'shipping', 'package', 'parcel', 'eta', 'arrive', 'shipped']
    },

    // ORDER CANCELLATION
    'order.cancel': {
        weight: 10,
        phrases: [
            'cancel my order', 'cancel order', 'cancel this order', 'cancel it',
            'i want to cancel', 'want to cancel', 'need to cancel', 'please cancel',
            'cancellation', 'order cancellation', 'stop my order', 'stop the order',
            'dont want it', 'dont want this', 'changed my mind', 'dont need it anymore',
            'abort order', 'revoke order', 'withdraw order',
            'order cancel karo', 'cancel karna hai', 'mujhe cancel karna hai'
        ],
        keywords: ['cancel', 'cancellation', 'abort', 'revoke', 'withdraw', 'stop']
    },

    // RETURNS & REPLACEMENTS
    'order.return': {
        weight: 10,
        phrases: [
            'return my order', 'return order', 'return this', 'i want to return',
            'return request', 'initiate return', 'start return', 'process return',
            'replace this', 'replacement', 'replace my order', 'exchange this',
            'exchange order', 'swap this', 'wrong item', 'wrong product',
            'defective', 'damaged', 'broken', 'not working', 'doesnt work',
            'size issue', 'wrong size', 'doesnt fit', 'too big', 'too small',
            'not what i ordered', 'different from picture', 'not as described',
            'return policy', 'how to return', 'can i return',
            'wapas karna hai', 'exchange karna hai', 'galat item aaya'
        ],
        keywords: ['return', 'replace', 'replacement', 'exchange', 'swap', 'refund', 'defective', 'damaged', 'broken', 'wrong']
    },

    // REFUND STATUS
    'order.refund': {
        weight: 9,
        phrases: [
            'refund status', 'where is my refund', 'refund kab milega',
            'money back', 'get my money', 'refund not received', 'pending refund',
            'refund timeline', 'refund time', 'how long for refund',
            'when will i get refund', 'refund process', 'refund initiated',
            'amount not credited', 'didnt receive refund', 'paisa wapas',
            'refund kab aayega', 'payment refund'
        ],
        keywords: ['refund', 'money back', 'credited', 'reimbursement']
    },

    // ADDRESS CHANGE
    'order.address': {
        weight: 8,
        phrases: [
            'change address', 'update address', 'wrong address', 'edit address',
            'modify address', 'change delivery address', 'different address',
            'new address', 'correct address', 'address change',
            'deliver somewhere else', 'change location', 'wrong location',
            'address galat hai', 'address badalna hai'
        ],
        keywords: ['address', 'location', 'destination', 'deliver to']
    },

    // ORDER ID PROVIDED
    'order.provide-id': {
        weight: 8,
        phrases: [
            'i have an order id', 'here is my order', 'my order id is',
            'order number is', 'this is my order', 'order id',
            'heres the order', 'heres my order id'
        ],
        keywords: []
    },

    // PRODUCT SEARCH
    'product.search': {
        weight: 7,
        phrases: [
            'show me', 'find me', 'search for', 'looking for', 'i want',
            'i need', 'can you show', 'do you have', 'any products',
            'products like', 'something like', 'similar to',
            'under rupees', 'under rs', 'below', 'budget friendly',
            'in my budget', 'affordable', 'cheap', 'expensive',
            'dikhao', 'chahiye', 'kuch dikhao', 'products dikhao'
        ],
        keywords: ['show', 'find', 'search', 'looking', 'want', 'need', 'buy', 'purchase', 'get']
    },

    // TRENDING/POPULAR
    'product.trending': {
        weight: 8,
        phrases: [
            'trending products', 'popular items', 'best sellers', 'bestsellers',
            'most popular', 'what is trending', 'whats hot', 'top products',
            'featured items', 'new arrivals', 'latest products', 'new collection',
            'top picks', 'recommended', 'top rated', 'highly rated',
            'best products', 'popular gifts', 'trending now'
        ],
        keywords: ['trending', 'popular', 'bestseller', 'featured', 'new arrival', 'latest', 'top', 'best']
    },

    // BROWSE CATEGORIES
    'product.browse': {
        weight: 7,
        phrases: [
            'browse products', 'browse categories', 'show categories',
            'all categories', 'shop by category', 'explore products',
            'see all', 'view all', 'list categories', 'what categories',
            'what do you sell', 'what products', 'product range'
        ],
        keywords: ['browse', 'category', 'categories', 'explore', 'catalog']
    },

    // GIFT IDEAS
    'catalog.gifting': {
        weight: 8,
        phrases: [
            'gift ideas', 'gift suggestions', 'gift for', 'present for',
            'birthday gift', 'anniversary gift', 'wedding gift', 'rakhi gift',
            'diwali gift', 'christmas gift', 'valentines gift', 'mothers day',
            'fathers day', 'gift for him', 'gift for her', 'gift for mom',
            'gift for dad', 'gift for friend', 'gift for boyfriend', 'gift for girlfriend',
            'corporate gift', 'office gift', 'bulk gifts', 'gift hamper',
            'gift box', 'combo gift', 'surprise gift',
            'what should i gift', 'suggest a gift', 'recommend gift',
            'gift kya du', 'gift ideas batao', 'kya gift du'
        ],
        keywords: ['gift', 'present', 'occasion', 'birthday', 'anniversary', 'wedding', 'festival', 'celebrate']
    },

    // OFFERS & DISCOUNTS
    'marketing.offer': {
        weight: 7,
        phrases: [
            'any offers', 'any discount', 'coupon code', 'promo code',
            'discount code', 'deals', 'sale', 'current offers',
            'special offer', 'best deal', 'cashback', 'offer hai kya',
            'discount chahiye', 'coupon hai', 'koi offer', 'sabse sasta',
            'cheap price', 'lowest price', 'price drop'
        ],
        keywords: ['offer', 'discount', 'coupon', 'promo', 'deal', 'sale', 'cashback']
    },

    // TALK TO HUMAN
    'support.agent': {
        weight: 9,
        phrases: [
            'talk to human', 'talk to agent', 'talk to support', 'real person',
            'human agent', 'customer care', 'customer support', 'call me',
            'speak to someone', 'connect to agent', 'live agent', 'live chat',
            'real human', 'transfer to human', 'escalate', 'manager',
            'supervisor', 'i want to talk', 'let me talk', 'need help',
            'connect me', 'human se baat', 'agent se baat karna hai',
            'kisi se baat karni hai', 'call karo'
        ],
        keywords: ['human', 'agent', 'support', 'person', 'talk', 'speak', 'call', 'connect', 'escalate']
    },

    // REPORT ISSUE
    'support.issue': {
        weight: 8,
        phrases: [
            'i have a problem', 'there is an issue', 'something wrong',
            'not working', 'facing issue', 'facing problem', 'bug',
            'error', 'complaint', 'complain', 'report issue', 'report problem',
            'help me', 'please help', 'need assistance', 'issue hai',
            'problem hai', 'kuch galat ho gaya', 'theek nahi hai'
        ],
        keywords: ['problem', 'issue', 'help', 'complaint', 'error', 'bug', 'wrong', 'broken', 'not working']
    },

    // LOGIN HELP
    'support.login': {
        weight: 7,
        phrases: [
            'login to account', 'how to login', 'sign in', 'cant login',
            'login issue', 'forgot password', 'reset password', 'account access',
            'my account', 'access account', 'login kaise karu', 'signin'
        ],
        keywords: ['login', 'signin', 'password', 'account']
    },

    // GREETINGS
    'greeting': {
        weight: 3,
        phrases: [
            'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
            'namaste', 'namaskar', 'howdy', 'hola', 'sup', 'whats up'
        ],
        keywords: ['hi', 'hello', 'hey', 'morning', 'afternoon', 'evening']
    },

    // THANKS
    'thanks': {
        weight: 3,
        phrases: [
            'thank you', 'thanks', 'thanks a lot', 'thank you so much',
            'appreciate it', 'helpful', 'great help', 'dhanyawad', 'shukriya'
        ],
        keywords: ['thank', 'thanks', 'appreciate']
    },

    // GOODBYE
    'goodbye': {
        weight: 3,
        phrases: [
            'bye', 'goodbye', 'see you', 'take care', 'thats all',
            'nothing else', 'im done', 'alvida', 'bye bye'
        ],
        keywords: ['bye', 'goodbye', 'done', 'nothing']
    }
};

// Product-related keywords that suggest product search intent
const PRODUCT_KEYWORDS = [
    'shirt', 'dress', 'saree', 'kurti', 'suit', 'jeans', 'pants', 'trousers',
    'bag', 'handbag', 'purse', 'wallet', 'watch', 'clock', 'jewelry', 'jewellery',
    'necklace', 'earring', 'bracelet', 'ring', 'pendant', 'chain',
    'mug', 'cup', 'bottle', 'tumbler', 'glass', 'plate', 'bowl',
    'box', 'hamper', 'basket', 'combo', 'set', 'kit', 'pack',
    'chocolate', 'cake', 'sweet', 'mithai', 'cookie', 'biscuit',
    'flower', 'bouquet', 'plant', 'rose', 'lily', 'orchid',
    'toy', 'teddy', 'bear', 'doll', 'game', 'puzzle',
    'perfume', 'deo', 'fragrance', 'scent', 'cologne',
    'photo', 'frame', 'album', 'collage', 'canvas', 'poster',
    'candle', 'lamp', 'light', 'diya', 'lantern',
    'decor', 'decoration', 'showpiece', 'figurine', 'vase', 'idol',
    'cushion', 'pillow', 'blanket', 'throw', 'bedsheet',
    'book', 'diary', 'journal', 'notebook', 'planner', 'pen',
    'keychain', 'keyring', 'magnet', 'coaster', 'sticker',
    'muffler', 'scarf', 'shawl', 'stole', 'cap', 'hat',
    'phone', 'mobile', 'cover', 'case', 'charger', 'accessory',
    'skin care', 'beauty', 'makeup', 'cosmetic', 'cream', 'lotion'
];

// Color keywords for product search
const COLOR_KEYWORDS = [
    'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple',
    'orange', 'brown', 'grey', 'gray', 'gold', 'silver', 'beige', 'cream',
    'maroon', 'navy', 'teal', 'turquoise', 'coral', 'peach', 'lavender',
    'lal', 'neela', 'hara', 'peela', 'kala', 'safed', 'gulabi'
];

// ============================================
// FUZZY MATCHING CONFIGURATION
// ============================================

const FUZZY_THRESHOLD = 75; // Minimum score to consider a match (0-100)
const PARTIAL_RATIO_THRESHOLD = 80;

/**
 * Calculate string similarity using multiple fuzzy methods
 */
const calculateSimilarity = (input, target) => {
    const ratio = fuzz.ratio(input, target);
    const partialRatio = fuzz.partial_ratio(input, target);
    const tokenSort = fuzz.token_sort_ratio(input, target);
    const tokenSet = fuzz.token_set_ratio(input, target);

    // Use the best matching score
    return Math.max(ratio, partialRatio, tokenSort, tokenSet);
};

/**
 * Normalize text for comparison
 */
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove special chars except spaces
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();
};

/**
 * Check if text contains any keyword from a list
 */
const containsKeyword = (text, keywords) => {
    const words = text.split(/\s+/);
    for (const keyword of keywords) {
        // Exact word match
        if (words.includes(keyword)) return { match: true, keyword, score: 100 };

        // Fuzzy match for typos
        for (const word of words) {
            const score = fuzz.ratio(word, keyword);
            if (score >= FUZZY_THRESHOLD) {
                return { match: true, keyword, score };
            }
        }
    }
    return { match: false, keyword: null, score: 0 };
};

/**
 * Extract order ID from text using multiple patterns
 */
export const extractOrderId = (text) => {
    // MongoDB ObjectId (24 hex chars)
    const hexMatch = text.match(/\b[0-9a-f]{24}\b/i);
    if (hexMatch) return hexMatch[0];

    // Numeric order ID (6+ digits)
    const numericMatch = text.match(/#?(\d{6,})/);
    if (numericMatch) return numericMatch[1];

    // Order prefix patterns (ORD-XXXXX, ORDER-XXXXX)
    const prefixMatch = text.match(/(?:ord|order)[#\-_]?(\w{5,})/i);
    if (prefixMatch) return prefixMatch[1];

    return null;
};

/**
 * Check if text contains product-related keywords
 */
const containsProductKeyword = (text) => {
    const normalized = normalizeText(text);

    for (const keyword of PRODUCT_KEYWORDS) {
        if (normalized.includes(keyword)) {
            return { found: true, keyword };
        }
        // Fuzzy match for misspellings
        const words = normalized.split(/\s+/);
        for (const word of words) {
            if (word.length > 3 && fuzz.ratio(word, keyword) >= 80) {
                return { found: true, keyword };
            }
        }
    }
    return { found: false, keyword: null };
};

/**
 * Extract color from text
 */
export const extractColor = (text) => {
    const normalized = normalizeText(text);
    for (const color of COLOR_KEYWORDS) {
        if (normalized.includes(color)) return color;
    }
    return null;
};

/**
 * Main intent detection function
 * Returns the detected intent with confidence score
 */
export const detectIntent = (rawText) => {
    const text = normalizeText(rawText);
    const words = text.split(/\s+/);

    // ============================================
    // PRIORITY 1: Check for product keywords FIRST
    // Single-word queries containing product names should go to search
    // ============================================
    const productMatch = containsProductKeyword(text);
    if (productMatch.found) {
        // If the query is JUST a product keyword (or very short), it's definitely a search
        if (words.length <= 3 || text === productMatch.keyword || text.endsWith('s') && text.slice(0, -1) === productMatch.keyword) {
            return {
                intent: 'product.search',
                confidence: 0.9,
                matchedPhrase: null,
                matchedKeywords: [productMatch.keyword],
                extractedProductKeyword: productMatch.keyword
            };
        }
    }

    let bestIntent = 'general';
    let bestScore = 0;
    let matchedPhrase = null;
    let matchedKeywords = [];

    // ============================================
    // PRIORITY 2: Score each intent with phrase/keyword matching
    // ============================================
    for (const [intentName, intentData] of Object.entries(INTENT_PATTERNS)) {
        let intentScore = 0;
        let phrasesMatched = [];
        let keywordsMatched = [];

        // Check phrase matches (weighted higher)
        for (const phrase of intentData.phrases) {
            // For short inputs (< 6 chars), require higher similarity
            const minSimilarity = text.length < 6 ? 90 : FUZZY_THRESHOLD;

            // Also require input to be at least 50% the length of the phrase for partial matches
            // This prevents "cakes" from matching "top picks"
            if (text.length < phrase.length * 0.5 && !text.includes(phrase) && !phrase.includes(text)) {
                continue; // Skip this phrase - input is too short
            }

            const similarity = calculateSimilarity(text, phrase);
            if (similarity >= minSimilarity) {
                intentScore += (similarity / 100) * intentData.weight * 2;
                phrasesMatched.push({ phrase, similarity });
            }

            // Check if phrase is contained in text (exact substring)
            if (text.includes(phrase)) {
                intentScore += intentData.weight * 2;
                phrasesMatched.push({ phrase, similarity: 100 });
            }
        }

        // Check keyword matches
        for (const keyword of intentData.keywords) {
            const result = containsKeyword(text, [keyword]);
            if (result.match) {
                intentScore += (result.score / 100) * (intentData.weight / 2);
                keywordsMatched.push(keyword);
            }
        }

        // If this intent has higher score, update best match
        if (intentScore > bestScore) {
            bestScore = intentScore;
            bestIntent = intentName;
            matchedPhrase = phrasesMatched.length > 0 ? phrasesMatched[0].phrase : null;
            matchedKeywords = keywordsMatched;
        }
    }

    // ============================================
    // PRIORITY 3: Fallback to product search for low-confidence matches
    // ============================================
    if (bestScore < 10 && productMatch.found) {
        return {
            intent: 'product.search',
            confidence: 0.7,
            matchedPhrase: null,
            matchedKeywords: [productMatch.keyword],
            extractedProductKeyword: productMatch.keyword
        };
    }

    // Handle greetings and thanks with lower priority
    if (bestIntent === 'greeting' || bestIntent === 'thanks' || bestIntent === 'goodbye') {
        // Check if there's also a real intent in the message
        // e.g., "hi, i want to track my order" should be order.status
        const textWithoutGreeting = text
            .replace(/\b(hi|hello|hey|thanks|thank you|bye)\b/gi, '')
            .trim();

        if (textWithoutGreeting.length > 5) {
            const secondaryResult = detectIntentFromText(textWithoutGreeting);
            if (secondaryResult.intent !== 'general') {
                return secondaryResult;
            }
        }
    }

    // Calculate confidence (normalize score to 0-1)
    const maxPossibleScore = 50; // Rough estimate of max score
    const confidence = Math.min(bestScore / maxPossibleScore, 1);

    return {
        intent: bestIntent,
        confidence: confidence,
        matchedPhrase,
        matchedKeywords,
        rawScore: bestScore
    };
};

/**
 * Helper function for recursive intent detection
 */
const detectIntentFromText = (text) => {
    let bestIntent = 'general';
    let bestScore = 0;

    for (const [intentName, intentData] of Object.entries(INTENT_PATTERNS)) {
        let intentScore = 0;

        for (const phrase of intentData.phrases) {
            const similarity = calculateSimilarity(text, phrase);
            if (similarity >= FUZZY_THRESHOLD) {
                intentScore += (similarity / 100) * intentData.weight;
            }
        }

        for (const keyword of intentData.keywords) {
            if (text.includes(keyword)) {
                intentScore += intentData.weight / 2;
            }
        }

        if (intentScore > bestScore) {
            bestScore = intentScore;
            bestIntent = intentName;
        }
    }

    return { intent: bestIntent, confidence: bestScore / 50 };
};

/**
 * Get suggestions based on detected intent
 */
export const getSuggestionsForIntent = (intent) => {
    const suggestionMap = {
        'order.status': ['Cancel this order', 'Change address', 'Return this', 'Talk to support'],
        'order.cancel': ['Track different order', 'Browse products', 'Talk to support'],
        'order.return': ['Track return status', 'Talk to support', 'Browse products'],
        'order.refund': ['Track order', 'Talk to support', 'Browse products'],
        'order.address': ['Track order', 'Talk to support'],
        'product.search': ['Show more', 'Different category', 'Track order', 'Gift ideas'],
        'product.trending': ['Gift ideas', 'Under ₹500', 'Premium gifts', 'Track order'],
        'product.browse': ['Trending items', 'Gift hampers', 'Under ₹500'],
        'catalog.gifting': ['Birthday gifts', 'Anniversary gifts', 'Under ₹1000', 'Premium gifts'],
        'marketing.offer': ['Apply coupon', 'Browse products', 'Track order'],
        'support.agent': ['Describe your issue', 'Track order', 'Cancel order'],
        'support.issue': ['Track order', 'Talk to agent', 'Return item'],
        'greeting': ['Track my order', 'Search products', 'Gift ideas', 'Talk to support'],
        'thanks': ['Anything else?', 'Track order', 'Browse products'],
        'goodbye': ['Track order', 'Browse products', 'Contact us'],
        'general': ['Track my order', 'Cancel an order', 'Return or replace', 'Search products', 'Talk to support']
    };

    return suggestionMap[intent] || suggestionMap['general'];
};

export default {
    detectIntent,
    extractOrderId,
    extractColor,
    getSuggestionsForIntent,
    PRODUCT_KEYWORDS,
    COLOR_KEYWORDS
};