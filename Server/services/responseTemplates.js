/**
 * Response Templates Service
 * Provides varied, natural-sounding responses for the chatbot
 * Includes time-aware greetings and personalized messages
 */

// ============================================
// RESPONSE VARIATION TEMPLATES
// ============================================

const RESPONSE_TEMPLATES = {
    // GREETINGS (time-aware)
    greeting: {
        morning: [
            "Good morning! ☀️ I'm Ava, your shopping assistant. How can I help you today?",
            "Morning! 🌅 Ready to help you with orders, products, or anything else!",
            "Good morning! Hope your day is off to a great start. What can I do for you?",
            "Hello! ☀️ Starting the day fresh. How may I assist you?"
        ],
        afternoon: [
            "Good afternoon! 🌤️ I'm here to help. What do you need?",
            "Hello! Hope you're having a productive day. How can I assist?",
            "Hi there! 👋 Afternoon check-in - what can I help with?",
            "Good afternoon! Ready to help with orders, products, or support."
        ],
        evening: [
            "Good evening! 🌙 How can I help you today?",
            "Evening! 🌆 I'm here to assist. What do you need?",
            "Hi there! Winding down the day? Let me help you with anything.",
            "Good evening! 🌙 Whether it's orders or shopping, I'm here for you."
        ],
        night: [
            "Hi there! 🌙 Burning the midnight oil? I'm here to help!",
            "Hello! Late night shopping? I've got you covered.",
            "Hey! 🦉 Night owl like me? What can I help you with?",
            "Hi! Even at this hour, I'm here to assist you."
        ],
        default: [
            "Hi there! 👋 I'm Ava, your assistant. How can I help?",
            "Hello! Welcome back. What can I do for you today?",
            "Hey! 😊 I'm here to help with orders, products, or support.",
            "Hi! Ready to assist you. What do you need?"
        ]
    },

    // WELCOME MESSAGES (for new sessions)
    welcome: {
        loggedIn: [
            "Hi {{name}}! 👋 Great to see you. I can help you track orders, search products, or handle returns. What do you need?",
            "Welcome back, {{name}}! 🎉 Need help with an order or looking for something new?",
            "Hey {{name}}! 😊 I'm here to help. Track orders, find products, or get support - what would you like?",
            "Hello {{name}}! Ready to help with your orders or shopping needs today."
        ],
        anonymous: [
            "Hi there! 👋 I'm Ava, your assistant. I can help you track orders, search products, or connect you with support. What do you need?",
            "Hello! Welcome to Gifts n Gifts. I can help with orders, products, or any questions you have!",
            "Hey! 😊 I'm here to assist. Whether it's tracking, shopping, or support - let me know!",
            "Hi! Ready to help you with orders, products, returns, or anything else. What's on your mind?"
        ]
    },

    // ORDER STATUS RESPONSES
    orderStatus: {
        found: [
            "Order {{orderShort}} is {{statusLabel}}. {{additionalInfo}}",
            "I found your order! #{{orderShort}} is currently {{statusLabel}}. {{additionalInfo}}",
            "Here's the update: Order {{orderShort}} is {{statusLabel}}. {{additionalInfo}}",
            "Got it! Your order #{{orderShort}} status: {{statusLabel}}. {{additionalInfo}}"
        ],
        delivered: [
            "Great news! 🎉 Order {{orderShort}} was delivered. Hope you love it!",
            "Your order #{{orderShort}} is delivered! ✅ Enjoy your purchase!",
            "Order {{orderShort}} - Delivered successfully! 📦✨ Thanks for shopping with us!",
            "Awesome! Order #{{orderShort}} reached you. Happy with it? Leave us a review!"
        ],
        shipped: [
            "Exciting! 🚚 Order {{orderShort}} is on its way. Expected by {{eta}}.",
            "Your order #{{orderShort}} shipped! It's traveling to you now. Track it for live updates.",
            "Order {{orderShort}} is out for shipping! You'll have it soon. 📦",
            "Good news! Order #{{orderShort}} shipped and is en route to you."
        ],
        needLogin: [
            "I'd love to help track your order! Please log in so I can find it, or share the order ID directly.",
            "To see your orders, please sign in. Or if you have the order ID, share it with me!",
            "Log in to view all your orders, or paste the order ID and I'll look it up for you.",
            "I need you to log in to access your orders. Alternatively, share your order ID if you have it."
        ],
        noOrders: [
            "You don't have any orders yet! 🛒 Start shopping and I'll help you track everything.",
            "No orders found! Ready to explore our products? I can show you trending items!",
            "Looks like you haven't placed an order yet. Want me to show you some popular products?",
            "No orders on your account yet. Shall I help you find something special?"
        ],
        notFound: [
            "I couldn't find an order with that ID. Double-check the order ID and try again?",
            "Hmm, that order ID doesn't match our records. Please verify and share again.",
            "No luck finding that order. Make sure you've entered the complete order ID.",
            "Order not found. Check the ID from your confirmation email and try again."
        ]
    },

    // ORDER CANCELLATION
    orderCancel: {
        success: [
            "Done! ✅ Order {{orderShort}} is cancelled. Refund will process in 5-7 business days.",
            "Order #{{orderShort}} successfully cancelled. Your refund is on its way!",
            "Cancelled! Order {{orderShort}} is stopped. Expect your refund within a week.",
            "Got it! Order #{{orderShort}} cancelled. Refund typically takes 5-7 business days."
        ],
        confirmRequired: [
            "Are you sure you want to cancel order #{{orderShort}}? Reply 'YES' to confirm.",
            "Just to confirm - cancel order #{{orderShort}} ({{itemCount}} items, {{totalAmount}})? Say 'YES' to proceed.",
            "Before I cancel order #{{orderShort}}, please confirm by replying 'YES'.",
            "Cancel order #{{orderShort}}? This cannot be undone. Reply 'YES' to confirm."
        ],
        notCancellable: [
            "This order is already {{status}}, so I've raised ticket {{ticketId}} for manual review. Support will call you shortly.",
            "Order is {{status}} and can't be auto-cancelled. Created ticket #{{ticketId}} for you - our team will reach out.",
            "Since the order is {{status}}, I've escalated this to support (Ticket: {{ticketId}}). They'll contact you soon.",
            "Can't cancel - order is {{status}}. I've logged ticket {{ticketId}}. Expect a callback within 12 hours."
        ],
        needLogin: [
            "Please log in to cancel orders, or share the order ID you want to cancel.",
            "I need you to sign in first to cancel orders. Or provide the order ID directly.",
            "Log in to access your orders for cancellation, or give me the specific order ID.",
            "To cancel an order, either log in or share the order ID with me."
        ]
    },

    // RETURN/REPLACEMENT
    orderReturn: {
        initiated: [
            "Return request logged! 📋 Ticket {{ticketId}} created. Our team will schedule pickup within 12 hours.",
            "Got it! Created return ticket #{{ticketId}}. Expect pickup instructions via email/SMS soon.",
            "Return initiated for order {{orderShort}}. Ticket: {{ticketId}}. We'll arrange pickup shortly.",
            "Return request received! Ticket #{{ticketId}} is active. Watch for pickup details."
        ],
        notDelivered: [
            "Returns only open after delivery. Your order is currently {{status}}. I'll remind you once it arrives!",
            "Can't initiate return yet - order is {{status}}. Once delivered, I can help with returns.",
            "Your order is still {{status}}. Return window opens after delivery. Want me to track it instead?",
            "Order needs to be delivered first (currently: {{status}}). Check back after you receive it!"
        ],
        needLogin: [
            "Please log in to process returns, or share the order ID for the item you want to return.",
            "I need you to sign in to find your delivered orders. Or share the order ID directly.",
            "Log in to access return options, or provide the specific order ID.",
            "To initiate a return, please log in or give me the order ID."
        ]
    },

    // REFUND RESPONSES
    refund: [
        "Refunds go back to your original payment method. UPI/card refunds take 2-5 working days after cancellation is confirmed.",
        "Once cancelled/returned, refunds process in 2-5 business days to your original payment method.",
        "Refund timeline: 2-5 business days after order cancellation or return pickup. It goes to your original payment source.",
        "Your refund will credit to the original payment method within 5 working days of cancellation/return confirmation."
    ],

    // ADDRESS CHANGE
    addressChange: [
        "You can update delivery address before shipping at My Orders > Manage Order. If already shipped, I can create a support ticket.",
        "Head to My Orders > Edit to change address (before shipping only). Need help with a shipped order? Let me know!",
        "Address change is possible before dispatch. Go to My Orders > Update Address. For shipped orders, I'll connect you with support.",
        "Pre-shipment: Change address in My Orders. Post-shipment: I can escalate to support for you."
    ],

    // PRODUCT SEARCH
    productSearch: {
        found: [
            "Found {{count}} {{searchTerm}} for you! 🛍️ Check these out:",
            "Here are {{count}} matches for '{{searchTerm}}'! Take a look:",
            "Great picks! {{count}} products matching '{{searchTerm}}':",
            "I found {{count}} items matching what you're looking for:"
        ],
        foundWithFilters: [
            "Found {{count}} {{searchTerm}} {{filters}}. Here are the best matches:",
            "{{count}} results for '{{searchTerm}}' {{filters}}:",
            "Here's what I found - {{count}} items {{filters}}:",
            "Showing {{count}} {{searchTerm}} {{filters}}:"
        ],
        noResults: [
            "Sorry, we don't have '{{searchTerm}}' in stock right now. 😔 Here are some popular items instead:",
            "We couldn't find '{{searchTerm}}' in our catalog. Check out these trending products:",
            "No '{{searchTerm}}' available at the moment. Want to try searching for something else? Here's what's popular:",
            "Couldn't find any '{{searchTerm}}'. We might not carry this item yet. Here are some alternatives:"
        ],
        notAvailable: [
            "We don't currently have {{searchTerm}}. Would you like me to notify you when we add it?",
            "{{searchTerm}} isn't in our catalog yet. Try a different search or check out trending items!",
            "Sorry, no {{searchTerm}} found. We're always adding new products - check back soon!"
        ],
        error: [
            "I'm having trouble searching right now. Try again, or browse our categories!",
            "Search hiccup! 😅 Please try again, or I can show you trending items.",
            "Oops, search isn't cooperating. Want to try different words, or browse categories?",
            "Technical glitch on search. Give it another shot, or check out what's trending!"
        ]
    },

    // TRENDING PRODUCTS
    trending: [
        "Here's what's hot right now! 🔥 Our most popular picks:",
        "Trending alert! 📈 These are flying off the shelves:",
        "Check out what everyone's loving right now:",
        "Top picks of the moment! 🌟 Customers are loving these:"
    ],

    // GIFT IDEAS
    gifting: {
        generic: [
            "Need gift ideas? 🎁 Tell me the occasion (birthday, anniversary) or budget and I'll curate perfect options!",
            "Let's find the perfect gift! What's the occasion? Or share a budget range.",
            "Gift shopping? 🎀 Tell me who it's for and the occasion - I'll suggest great options!",
            "I love helping with gifts! Share the occasion, recipient, or budget and let's find something special."
        ],
        withOccasion: [
            "Perfect {{occasion}} gifts coming up! 🎁 Here are some top picks:",
            "For {{occasion}}, these are absolutely lovely choices:",
            "{{occasion}} gift ideas? Say no more! Check these out:",
            "Best {{occasion}} gifts right here! 🎉 Take a look:"
        ]
    },

    // OFFERS & MARKETING
    offers: [
        "Today's deals: Free gift wrapping on orders ₹999+, and check our Sale section for up to 40% off! 🏷️",
        "Current offers: Sale items up to 40% off, free shipping on ₹599+, and gift wrap for orders ₹999+!",
        "Hot deals right now: Up to 40% off in Sale section! Plus free gift wrapping on ₹999+ orders. 🎁",
        "Don't miss out! 🏷️ 40% off sale items, free shipping ₹599+, complimentary gift wrap ₹999+."
    ],

    // SUPPORT ESCALATION
    supportEscalation: [
        "Connecting you with our support team! 📞 Expect a call or WhatsApp within 15 minutes.",
        "Got it! I'm looping in a live specialist. They'll reach out within 15 minutes.",
        "Human support incoming! 🙋 Our team will contact you shortly (usually within 15 min).",
        "Escalated to our support team! Stay tuned for their call/message within 15 minutes."
    ],

    // ISSUE LOGGED
    issueLogged: [
        "I've noted that down. Created ticket #{{ticketId}} for our support team. They'll follow up soon!",
        "Issue logged! Ticket: {{ticketId}}. Our team is on it. You can share more details anytime.",
        "Got it! Created ticket #{{ticketId}}. Feel free to add photos or more info - it all syncs.",
        "Ticket #{{ticketId}} created. 📋 Support will review and reach out. Add more details if needed!"
    ],

    // CONFIRMATIONS
    confirmation: {
        cancel: [
            "Are you sure you want to cancel order #{{orderShort}}? This cannot be undone. Reply 'YES' to confirm or 'NO' to keep it.",
            "Confirm cancellation of order #{{orderShort}} ({{itemCount}} items, {{totalAmount}})? Reply YES or NO.",
            "Before I cancel #{{orderShort}}, please confirm: YES to cancel, NO to keep the order.",
            "Just double-checking: Cancel order {{orderShort}}? Say YES to confirm."
        ],
        return: [
            "Initiating return for order #{{orderShort}}. Our team will arrange pickup. Confirm? Reply YES or NO.",
            "Ready to process return for #{{orderShort}}. Pickup will be scheduled. Confirm with YES?",
            "Return request for order {{orderShort}}. You'll get ₹{{amount}} refunded after pickup. Proceed? YES/NO",
            "Confirm return for #{{orderShort}}? Reply YES to proceed or NO to cancel."
        ]
    },

    // GENERAL FALLBACK
    general: [
        "I can help with order tracking, cancellations, returns, product search, and support. What would you like?",
        "Not quite sure what you need, but I'm here for orders, products, or support! Try the options below.",
        "I manage orders, products, and support queries. Pick an option below or rephrase your question!",
        "Hmm, let me know if you need to track orders, find products, or get help with something else!"
    ],

    // THANKS RESPONSES
    thanks: [
        "You're welcome! 😊 Anything else I can help with?",
        "Happy to help! Need anything else?",
        "Anytime! 🙌 Let me know if there's more I can do.",
        "Glad I could assist! Anything else on your mind?"
    ],

    // GOODBYE RESPONSES
    goodbye: [
        "Take care! 👋 Come back anytime you need help.",
        "Bye for now! Happy shopping! 🛍️",
        "See you later! Don't hesitate to reach out anytime.",
        "Goodbye! Wishing you a great day ahead! ✨"
    ],

    // LOGIN PROMPT
    loginPrompt: [
        "To view your orders, please sign in using the button at the top right. Or share your order ID if you have it!",
        "Log in to access all your orders. Alternatively, paste your order ID and I'll look it up.",
        "Sign in to see your order history, or give me the order ID and I'll track it for you.",
        "Please log in (top right corner) to manage orders. Got an order ID? Share it directly!"
    ],

    // ORDER ID PROMPT
    orderIdPrompt: [
        "Please paste your order ID here and I'll look it up! 📋 You'll find it in your confirmation email or SMS.",
        "Share your 24-character order ID (from your email/SMS) and I'll track it for you.",
        "Got your order ID handy? Paste it here! It's in your order confirmation.",
        "Enter your order ID below. Check your confirmation email if you need to find it."
    ]
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get time of day based on hour
 */
const getTimeOfDay = (hour) => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
};

/**
 * Pick a random item from an array
 */
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Replace template variables with actual values
 */
const interpolate = (template, variables = {}) => {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }
    return result;
};

// ============================================
// EXPORTED FUNCTIONS
// ============================================

/**
 * Get a greeting based on time of day
 */
export const getGreeting = (timezone = 'Asia/Kolkata') => {
    try {
        const now = new Date();
        const hour = parseInt(now.toLocaleString('en-US', {
            timeZone: timezone,
            hour: 'numeric',
            hour12: false
        }));
        const timeOfDay = getTimeOfDay(hour);
        return pickRandom(RESPONSE_TEMPLATES.greeting[timeOfDay] || RESPONSE_TEMPLATES.greeting.default);
    } catch {
        return pickRandom(RESPONSE_TEMPLATES.greeting.default);
    }
};

/**
 * Get welcome message (for new sessions)
 */
export const getWelcomeMessage = (userName = null, timezone = 'Asia/Kolkata') => {
    const templates = userName
        ? RESPONSE_TEMPLATES.welcome.loggedIn
        : RESPONSE_TEMPLATES.welcome.anonymous;

    let message = pickRandom(templates);

    if (userName) {
        const firstName = userName.split(' ')[0];
        message = interpolate(message, { name: firstName });
    }

    return message;
};

/**
 * Get order status response
 */
export const getOrderStatusResponse = (type, variables = {}) => {
    const templates = RESPONSE_TEMPLATES.orderStatus[type];
    if (!templates) return RESPONSE_TEMPLATES.orderStatus.found[0];

    return interpolate(pickRandom(templates), variables);
};

/**
 * Get order cancel response
 */
export const getOrderCancelResponse = (type, variables = {}) => {
    const templates = RESPONSE_TEMPLATES.orderCancel[type];
    if (!templates) return '';

    return interpolate(pickRandom(templates), variables);
};

/**
 * Get return response
 */
export const getReturnResponse = (type, variables = {}) => {
    const templates = RESPONSE_TEMPLATES.orderReturn[type];
    if (!templates) return '';

    return interpolate(pickRandom(templates), variables);
};

/**
 * Get refund response
 */
export const getRefundResponse = () => pickRandom(RESPONSE_TEMPLATES.refund);

/**
 * Get address change response
 */
export const getAddressResponse = () => pickRandom(RESPONSE_TEMPLATES.addressChange);

/**
 * Get product search response
 */
export const getProductSearchResponse = (type, variables = {}) => {
    const templates = RESPONSE_TEMPLATES.productSearch[type];
    if (!templates) return '';

    return interpolate(pickRandom(templates), variables);
};

/**
 * Get trending products response
 */
export const getTrendingResponse = () => pickRandom(RESPONSE_TEMPLATES.trending);

/**
 * Get gifting response
 */
export const getGiftingResponse = (occasion = null, variables = {}) => {
    if (occasion) {
        return interpolate(pickRandom(RESPONSE_TEMPLATES.gifting.withOccasion), { ...variables, occasion });
    }
    return pickRandom(RESPONSE_TEMPLATES.gifting.generic);
};

/**
 * Get offers response
 */
export const getOffersResponse = () => pickRandom(RESPONSE_TEMPLATES.offers);

/**
 * Get support escalation response
 */
export const getSupportEscalationResponse = () => pickRandom(RESPONSE_TEMPLATES.supportEscalation);

/**
 * Get issue logged response
 */
export const getIssueLoggedResponse = (ticketId) => {
    return interpolate(pickRandom(RESPONSE_TEMPLATES.issueLogged), { ticketId });
};

/**
 * Get confirmation prompt
 */
export const getConfirmationPrompt = (type, variables = {}) => {
    const templates = RESPONSE_TEMPLATES.confirmation[type];
    if (!templates) return '';

    return interpolate(pickRandom(templates), variables);
};

/**
 * Get general fallback response
 */
export const getGeneralResponse = () => pickRandom(RESPONSE_TEMPLATES.general);

/**
 * Get thanks response
 */
export const getThanksResponse = () => pickRandom(RESPONSE_TEMPLATES.thanks);

/**
 * Get goodbye response
 */
export const getGoodbyeResponse = () => pickRandom(RESPONSE_TEMPLATES.goodbye);

/**
 * Get login prompt
 */
export const getLoginPrompt = () => pickRandom(RESPONSE_TEMPLATES.loginPrompt);

/**
 * Get order ID prompt
 */
export const getOrderIdPrompt = () => pickRandom(RESPONSE_TEMPLATES.orderIdPrompt);

export default {
    getGreeting,
    getWelcomeMessage,
    getOrderStatusResponse,
    getOrderCancelResponse,
    getReturnResponse,
    getRefundResponse,
    getAddressResponse,
    getProductSearchResponse,
    getTrendingResponse,
    getGiftingResponse,
    getOffersResponse,
    getSupportEscalationResponse,
    getIssueLoggedResponse,
    getConfirmationPrompt,
    getGeneralResponse,
    getThanksResponse,
    getGoodbyeResponse,
    getLoginPrompt,
    getOrderIdPrompt
};