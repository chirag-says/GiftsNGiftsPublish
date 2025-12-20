import crypto from 'crypto';
import mongoose from 'mongoose';
import orderModel from '../model/order.js';
import { ChatSession, SupportTicket } from '../model/supportModel.js';
import { searchProducts, getTrendingProducts, getProductsByCategory, simpleSearch } from '../services/productSearchService.js';

// Comprehensive suggestions - both order management AND product search
const BASE_SUGGESTIONS = [
    'Track my order',
    'Cancel an order',
    'Return or replace',
    'Search products',
    'Talk to support'
];

const ORDER_STATUS_COPY = {
    Pending: 'waiting for confirmation',
    Processing: 'being prepared',
    Packed: 'packed and ready to ship',
    Shipped: 'on the way to you',
    Delivered: 'delivered successfully',
    'Out for Delivery': 'out with the courier',
    Cancelled: 'cancelled',
    Returned: 'returned',
    Refunded: 'refunded'
};

const formatCurrency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
});

const sanitizeMessage = (value = '') => value.replace(/\s+/g, ' ').trim();
const makeSessionId = () => `BOT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const buildDeviceMeta = (metadata = {}) => ({
    browser: metadata.browser || metadata.userAgent,
    platform: metadata.platform || metadata.device || 'web',
    locale: metadata.locale || metadata.language,
    timezone: metadata.timezone
});

const defaultWelcome = (name) => {
    const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
    return `${greeting} I am Ava, your assistant. I can track orders, process returns/cancellations, search products, and help with support. How can I help you today?`;
};

const detectIntent = (text) => {
    const normalized = text.toLowerCase();

    // ============================================
    // PRIORITY 1: Order-related intents (check FIRST!)
    // ============================================
    if (/cancel/.test(normalized) && /order/i.test(normalized)) return 'order.cancel';
    if (/cancel\s*(my|the|an)?\s*order/i.test(normalized)) return 'order.cancel';
    if (/cancel/i.test(normalized)) return 'order.cancel';

    if (/return|replace|exchange/i.test(normalized)) return 'order.return';

    if (/track|status|where.*order|where.*my|delivery|shipment|order.*status|my.*order/i.test(normalized)) return 'order.status';

    if (/address|change address|update address/i.test(normalized)) return 'order.address';

    if (/refund/i.test(normalized)) return 'order.refund';

    // ============================================
    // PRIORITY 2: Support intents
    // ============================================
    if (/agent|human|support|person|talk.*to|speak.*to|customer.*care/i.test(normalized)) return 'support.agent';
    if (/help|issue|problem|complaint|not working|broken|damaged/i.test(normalized)) return 'support.issue';

    // ============================================
    // PRIORITY 3: Marketing/Gifting
    // ============================================
    if (/offer|discount|deal|coupon|promo|sale/i.test(normalized)) return 'marketing.offer';
    if (/gift|ideas|recommend|occasion|birthday|anniversary|wedding|festive/i.test(normalized)) return 'catalog.gifting';

    // ============================================
    // PRIORITY 4: Product search intents
    // ============================================
    if (/trending|popular|best\s*sellers?|featured|new arrivals?|latest products?/i.test(normalized)) {
        return 'product.trending';
    }
    if (/browse|category|categories|shop\s+by/i.test(normalized)) {
        return 'product.browse';
    }
    // Generic product search - only if no order/support keywords
    if (/(?:show|find|search|looking for|want|need|buy|get)\s+(?:me\s+)?(?:some\s+)?(?:a\s+)?/i.test(normalized)) {
        return 'product.search';
    }
    if (/(?:under|below|above|around|between)\s*(?:₹|rs\.?|inr)?\s*\d+/i.test(normalized)) {
        return 'product.search';
    }


    // If contains product-like keywords, try search
    const productKeywords = ['shirt', 'dress', 'bag', 'watch', 'mug', 'box', 'hamper', 'chocolate',
        'flower', 'cake', 'toy', 'jewelry', 'perfume', 'wallet', 'photo', 'frame',
        'candle', 'lamp', 'decor', 'plant', 'book', 'pen', 'diary', 'cushion'];
    if (productKeywords.some(kw => normalized.includes(kw))) {
        return 'product.search';
    }

    return 'general';
};

const extractOrderId = (text) => {
    const hexMatch = text.match(/\b[0-9a-f]{24}\b/i);
    if (hexMatch) return hexMatch[0];
    const numericMatch = text.match(/#?(\d{6,})/);
    return numericMatch ? numericMatch[1] : null;
};

const statusRank = (status = 'Pending') => {
    const order = ['Pending', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const idx = order.findIndex((s) => s.toLowerCase() === status.toLowerCase());
    return idx === -1 ? 0 : idx;
};

const buildTimeline = (order) => {
    const rank = statusRank(order?.status);
    const steps = [
        { key: 'placed', label: 'Order placed', done: true, date: order?.placedAt },
        { key: 'processing', label: 'Processing', done: rank >= 1 },
        { key: 'shipped', label: 'Shipped', done: rank >= 3 },
        { key: 'out', label: 'Out for delivery', done: rank >= 4 },
        { key: 'delivered', label: 'Delivered', done: rank >= 5 }
    ];
    return steps;
};

const buildOrderSnapshot = (order) => {
    if (!order) return null;
    const idString = String(order._id);
    return {
        orderId: idString,
        orderShort: idString.slice(-6).toUpperCase(),
        status: order.status,
        statusLabel: ORDER_STATUS_COPY[order.status] || order.status,
        totalAmount: formatCurrency.format(order.totalAmount || 0),
        placedAt: order.placedAt,
        shippingCity: order.shippingAddress?.city,
        itemCount: order.items?.length || 0,
        items: (order.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity
        }))
    };
};

const composeSuggestions = (primary = [], secondary = []) => {
    const merged = [...BASE_SUGGESTIONS];
    [...primary, ...secondary].forEach((option) => {
        if (option && !merged.includes(option)) merged.push(option);
    });
    return merged.slice(0, 8);
};

const ensureSession = async (params = {}) => {
    const {
        sessionId,
        userId,
        userName,
        userEmail,
        userType = 'customer',
        metadata,
        source = 'web'
    } = params;

    let session = sessionId ? await ChatSession.findOne({ sessionId }) : null;

    if (!session && userId) {
        session = await ChatSession.findOne({
            userId,
            status: { $ne: 'closed' },
            channel: 'chatbot'
        }).sort({ createdAt: -1 });
    }

    if (session) {
        session.status = 'active';
        // Update user info if provided (handles case when user logs in after starting a session)
        if (userId && !session.userId) {
            session.userId = userId;
        }
        session.userName = session.userName || userName;
        session.userEmail = session.userEmail || userEmail;
        session.deviceMeta = { ...session.deviceMeta, ...buildDeviceMeta(metadata) };
        if (!session.context?.quickReplies?.length) {
            session.context = {
                ...(session.context || {}),
                quickReplies: BASE_SUGGESTIONS
            };
        }
        console.log('[Chatbot] Resuming session:', session.sessionId, 'UserId:', session.userId);
        return { session, isNew: false };
    }

    const newSession = new ChatSession({
        sessionId: makeSessionId(),
        userId,
        userName,
        userEmail,
        userType,
        status: 'active',
        channel: 'chatbot',
        source,
        deviceMeta: buildDeviceMeta(metadata),
        context: {
            lastIntent: 'welcome',
            quickReplies: BASE_SUGGESTIONS
        },
        messages: [{
            sender: 'system',
            message: defaultWelcome(userName),
            intent: 'welcome'
        }]
    });

    console.log('[Chatbot] Creating new session:', newSession.sessionId, 'UserId:', userId);
    return { session: newSession, isNew: true };
};

const trimMessages = (messages = []) => messages.slice(-60);

const resolveOrder = async ({ session, explicitOrderId, userId }) => {
    // Convert userId string to ObjectId if valid
    const userObjectId = userId && isObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;

    console.log('[Chatbot] resolveOrder called with:', {
        explicitOrderId,
        userId,
        userObjectId: userObjectId?.toString(),
        sessionUserId: session?.userId?.toString()
    });

    if (explicitOrderId) {
        if (isObjectId(explicitOrderId)) {
            const query = { _id: new mongoose.Types.ObjectId(explicitOrderId) };
            if (userObjectId) query.user = userObjectId;
            console.log('[Chatbot] Searching by explicit orderId:', query);
            const match = await orderModel.findOne(query);
            if (match) {
                console.log('[Chatbot] Found order by explicit ID:', match._id);
                return match;
            }
        }
    }

    if (session?.context?.orderInContext) {
        console.log('[Chatbot] Checking order in context:', session.context.orderInContext);
        const fromContext = await orderModel.findById(session.context.orderInContext);
        if (fromContext && (!userObjectId || String(fromContext.user) === String(userObjectId))) {
            console.log('[Chatbot] Found order from context:', fromContext._id);
            return fromContext;
        }
    }

    // Use session.userId as fallback if payload.userId is not provided
    const effectiveUserId = userObjectId || (session?.userId && isObjectId(session.userId)
        ? new mongoose.Types.ObjectId(session.userId)
        : null);

    if (effectiveUserId) {
        console.log('[Chatbot] Searching latest order for user:', effectiveUserId.toString());
        const latestOrder = await orderModel.findOne({ user: effectiveUserId }).sort({ placedAt: -1 });
        if (latestOrder) {
            console.log('[Chatbot] Found latest order:', latestOrder._id, 'Status:', latestOrder.status);
        } else {
            console.log('[Chatbot] No orders found for user');
        }
        return latestOrder;
    }

    console.log('[Chatbot] No userId available to search orders');
    return null;
};

const createSupportTicketFromChat = async ({ session, order, type, message }) => {
    const title = type === 'return' ? 'Return requested via chatbot' : 'Manual support request from chatbot';
    const summary = order ? `Order ${String(order._id)} | ${order.status}` : 'Order details unavailable';
    const customerName = session.userName || 'Guest user';
    const email = session.userEmail || 'guest@giftngifts.com';

    const ticket = new SupportTicket({
        customerId: session.userId,
        customerName,
        email,
        phone: '',
        subject: title,
        description: `${summary}\n${message || ''}`.trim(),
        priority: type === 'return' ? 'high' : 'medium',
        category: 'orders',
        messages: [{
            sender: 'customer',
            message: message || 'Assistance requested from chatbot'
        }]
    });

    await ticket.save();
    return ticket;
};

const orderStatusResponse = async ({ session, userId, explicitOrderId }) => {
    const order = await resolveOrder({ session, explicitOrderId, userId });
    if (!order) {
        return {
            reply: "I couldn't find that order. Please share the 24-digit order ID or log in so I can fetch it automatically.",
            intent: 'order.status.pending-id',
            payload: null,
            suggestions: ['Here is my order ID', 'Show my latest order', 'Talk to support']
        };
    }

    const snapshot = buildOrderSnapshot(order);
    const timeline = buildTimeline(order);

    return {
        reply: `Order ${snapshot.orderShort} is ${snapshot.statusLabel}. ${timeline.find((step) => step.label === 'Delivered' && step.done) ? 'Thanks for shopping with us!' : 'I will notify you as it moves.'}`,
        intent: 'order.status',
        payload: {
            type: 'order-status',
            order: snapshot,
            timeline
        },
        contextUpdates: {
            orderInContext: order._id,
            orderSnapshot: snapshot
        },
        suggestions: composeSuggestions([
            'Cancel this order',
            'Change delivery address',
            'Talk to a human expert'
        ])
    };
};

const orderCancelResponse = async ({ session, userId, explicitOrderId }) => {
    const order = await resolveOrder({ session, explicitOrderId, userId });
    if (!order) {
        return {
            reply: 'I need the exact order ID to cancel. Please paste it here.',
            intent: 'order.cancel.need-id',
            suggestions: ['Track my order', 'Talk to support']
        };
    }

    const cancellableStatuses = ['Pending', 'Processing'];
    if (!cancellableStatuses.includes(order.status)) {
        const ticket = await createSupportTicketFromChat({
            session,
            order,
            type: 'manual',
            message: 'User attempted to cancel order but it is no longer cancellable.'
        });
        return {
            reply: `This order is already ${order.status}, so I raised ticket ${ticket.ticketId} for the support team to review manually. They will call you shortly.`,
            intent: 'order.cancel.escalated',
            payload: {
                type: 'ticket',
                ticketId: ticket.ticketId
            },
            suggestions: composeSuggestions(['Track my latest order'])
        };
    }

    order.status = 'Cancelled';
    await order.save();

    const snapshot = buildOrderSnapshot(order);
    return {
        reply: `Done! Order ${snapshot.orderShort} is cancelled. Refunds typically reflect within 5-7 business days through the original payment method.`,
        intent: 'order.cancel',
        payload: {
            type: 'order-cancelled',
            order: snapshot
        },
        contextUpdates: {
            orderInContext: order._id,
            orderSnapshot: snapshot
        },
        suggestions: composeSuggestions(['Track another order', 'Browse new arrivals'])
    };
};

const orderReturnResponse = async ({ session, userId, explicitOrderId }) => {
    const order = await resolveOrder({ session, explicitOrderId, userId });
    if (!order) {
        return {
            reply: 'Share the order ID so that I can start the return paperwork for you.',
            intent: 'order.return.need-id',
            suggestions: ['Here is my order ID', 'Talk to support']
        };
    }

    if (order.status !== 'Delivered') {
        return {
            reply: `Returns open right after delivery. This order is currently ${order.status}, so I will remind you once it is marked delivered.`,
            intent: 'order.return.wait',
            suggestions: composeSuggestions(['Track delivery status'])
        };
    }

    const ticket = await createSupportTicketFromChat({
        session,
        order,
        type: 'return',
        message: 'Customer requested a return via chatbot.'
    });

    return {
        reply: `I have logged return ticket ${ticket.ticketId}. Our support crew will schedule a pickup and share packaging instructions within 12 hours.`,
        intent: 'order.return',
        payload: {
            type: 'ticket',
            ticketId: ticket.ticketId
        },
        suggestions: composeSuggestions(['Track pickup status', 'Talk to a human expert'])
    };
};

const addressResponse = ({ session }) => ({
    reply: 'You can update the delivery address before the order ships. Head over to My Orders > Manage Order and choose "Update address". I can create a support ticket if the package already left the warehouse.',
    intent: 'order.address',
    suggestions: composeSuggestions(['Track my latest order', 'Talk to support'])
});

const refundResponse = ({ session }) => ({
    reply: 'Refunds go back to the original payment method. UPI/card refunds take 2-5 working days once the order is cancelled or the return is scanned. I will keep tracking it for you.',
    intent: 'order.refund',
    suggestions: composeSuggestions(['Track refund status', 'Talk to a human expert'])
});

const marketingResponse = () => ({
    reply: 'Here are today’s highlights: 1) Mid-week Flash Sale on premium hampers (extra 10% off). 2) Free gift wrapping on orders above ₹999. Want me to apply the best coupon at checkout?',
    intent: 'marketing.offer',
    suggestions: composeSuggestions(['Show gifting ideas', 'Track my order'])
});

const giftingResponse = async ({ userMessage }) => {
    // Try to search for gift-related products
    const searchResult = await searchProducts(userMessage + ' gift', { limit: 4 });

    if (searchResult.success && searchResult.products.length > 0) {
        return {
            reply: `Here are some perfect gifting options for you! 🎁`,
            intent: 'catalog.gifting',
            payload: {
                type: 'product-list',
                products: searchResult.products,
                searchInfo: searchResult.parsed
            },
            suggestions: composeSuggestions(['Gift ideas under ₹1000', 'Show more gifts', 'Corporate gifting'])
        };
    }

    return {
        reply: 'Need ideas? Tell me the occasion (birthday, anniversary, corporate) or budget and I will curate the perfect gift options for you!',
        intent: 'catalog.gifting',
        suggestions: composeSuggestions(['Gift ideas under ₹1500', 'Birthday gifts', 'Corporate gifting'])
    };
};

// ============================================
// PRODUCT SEARCH RESPONSES
// ============================================

const productSearchResponse = async ({ userMessage }) => {
    let searchResult = await searchProducts(userMessage, { limit: 5 });

    // If NLP search found no products, try a simpler keyword search
    if (searchResult.success && searchResult.products.length === 0) {
        // Extract the most likely product keyword from the message
        const words = userMessage.toLowerCase().split(/\s+/);
        const productKeywords = ['cake', 'saree', 'gift', 'flower', 'chocolate', 'mug', 'watch',
            'bag', 'wallet', 'jewelry', 'hamper', 'box', 'frame', 'candle',
            'lamp', 'plant', 'dress', 'shirt', 'toy', 'perfume', 'decor'];

        // Find a product keyword in the message
        const foundKeyword = words.find(word => productKeywords.includes(word));

        if (foundKeyword) {
            console.log('[ProductSearch] Trying simple search for:', foundKeyword);
            const simpleResults = await simpleSearch(foundKeyword, 5);
            if (simpleResults.length > 0) {
                searchResult = {
                    success: true,
                    products: simpleResults,
                    totalFound: simpleResults.length,
                    parsed: { searchTerms: [foundKeyword], priceFilter: null, colors: [] }
                };
            }
        }
    }

    if (!searchResult.success) {
        return {
            reply: "I'm having trouble searching right now. Please try again or browse our categories!",
            intent: 'product.search.error',
            suggestions: composeSuggestions(['Show trending items', 'Browse categories', 'Talk to support'])
        };
    }

    if (searchResult.products.length === 0) {
        const trending = await getTrendingProducts(4);
        return {
            reply: `I couldn't find products matching your search. Here are some popular items you might like:`,
            intent: 'product.search.no-results',
            payload: trending.length > 0 ? {
                type: 'product-list',
                products: trending
            } : null,
            suggestions: composeSuggestions(['Show all products', 'Gift hampers', 'Contact support'])
        };
    }

    // Build a natural response based on what was searched
    const { priceFilter, colors, searchTerms } = searchResult.parsed;
    let responseText = `Found ${searchResult.products.length} ${searchResult.products.length === 1 ? 'item' : 'great items'}`;

    if (searchTerms.length > 0) {
        responseText += ` for "${searchTerms.join(' ')}"`;
    }
    if (colors.length > 0) {
        responseText += ` in ${colors.join('/')}`;
    }
    if (priceFilter) {
        if (priceFilter.max && !priceFilter.min) {
            responseText += ` under ₹${priceFilter.max}`;
        } else if (priceFilter.min && !priceFilter.max) {
            responseText += ` above ₹${priceFilter.min}`;
        } else if (priceFilter.min && priceFilter.max) {
            responseText += ` between ₹${priceFilter.min}-₹${priceFilter.max}`;
        }
    }
    responseText += '. Check these out! 🛍️';

    return {
        reply: responseText,
        intent: 'product.search',
        payload: {
            type: 'product-list',
            products: searchResult.products,
            searchInfo: searchResult.parsed
        },
        suggestions: composeSuggestions(['Show more', 'Different category', 'Track order'])
    };
};

const trendingProductsResponse = async () => {
    const products = await getTrendingProducts(5);

    if (products.length === 0) {
        return {
            reply: "Our trending section is being updated. Try searching for something specific!",
            intent: 'product.trending',
            suggestions: composeSuggestions(['Gift ideas', 'Search products', 'Browse categories'])
        };
    }

    return {
        reply: "Here's what's trending right now! 🔥 These are our most popular picks:",
        intent: 'product.trending',
        payload: {
            type: 'product-list',
            products: products
        },
        suggestions: composeSuggestions(['Show me gifts', 'Items under ₹500', 'New arrivals'])
    };
};

const browseProductsResponse = async ({ userMessage }) => {
    // Try to extract category from message
    const categoryMatch = userMessage.match(/(?:browse|category|shop)\s+(.+)/i);

    if (categoryMatch) {
        const result = await getProductsByCategory(categoryMatch[1].trim(), 5);
        if (result.success && result.products.length > 0) {
            return {
                reply: `Here are top items from ${result.category}:`,
                intent: 'product.browse',
                payload: {
                    type: 'product-list',
                    products: result.products,
                    category: result.category
                },
                suggestions: composeSuggestions(['Show more', 'Different category', 'Gift ideas'])
            };
        }
    }

    return {
        reply: "What would you like to explore? You can ask me things like:\n• \"Show me gift hampers\"\n• \"Red items under ₹1000\"\n• \"Trending products\"",
        intent: 'product.browse',
        suggestions: composeSuggestions(['Trending items', 'Gift hampers', 'Under ₹500'])
    };
};

const supportEscalationResponse = (session) => {
    session.context = {
        ...(session.context || {}),
        escalateToHuman: true
    };

    return {
        reply: 'Okay, I will loop in a live specialist. Expect a call or WhatsApp follow-up within 15 minutes. Meanwhile I will keep monitoring your order.',
        intent: 'support.agent',
        suggestions: composeSuggestions(['Track my order', 'Share more details for agent'])
    };
};

const issueResponse = async ({ session, rawMessage }) => {
    const ticket = await createSupportTicketFromChat({
        session,
        type: 'manual',
        message: rawMessage
    });

    return {
        reply: `I noted that down and created ticket ${ticket.ticketId}. You can reply to this chat with photos or extra info anytime, we keep everything synced.`,
        intent: 'support.issue',
        payload: {
            type: 'ticket',
            ticketId: ticket.ticketId
        },
        suggestions: composeSuggestions(['Track my order', 'Talk to a human expert'])
    };
};

const generalResponse = () => ({
    reply: 'I manage everything from order tracking, refunds, gifting suggestions, to connecting you with support. Ask me anything or pick a quick action below.',
    intent: 'general',
    suggestions: BASE_SUGGESTIONS
});

export const createOrResumeSession = async (req, res) => {
    try {
        const { session } = await ensureSession(req.body || {});
        await session.save();
        res.status(200).json({ success: true, session });
    } catch (error) {
        console.error('Chatbot session error:', error);
        res.status(500).json({ success: false, message: 'Unable to start chat session.' });
    }
};

export const getChatSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await ChatSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' });
        }
        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to fetch session.' });
    }
};

export const getChatSessionsForUser = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || !isObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Valid userId is required.' });
        }

        const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 }).limit(10);
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to fetch sessions.' });
    }
};

export const handleChatMessage = async (req, res) => {
    try {
        const payload = req.body || {};
        const userMessage = sanitizeMessage(payload.message);
        if (!userMessage) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
        }

        const { session } = await ensureSession(payload);
        const intent = detectIntent(userMessage);
        const explicitOrderId = payload.orderId || extractOrderId(userMessage);

        session.messages.push({
            sender: 'user',
            message: userMessage,
            intent: 'user.input'
        });

        let botResponse;
        switch (intent) {
            // Product search intents
            case 'product.search':
                botResponse = await productSearchResponse({ userMessage });
                break;
            case 'product.trending':
                botResponse = await trendingProductsResponse();
                break;
            case 'product.browse':
                botResponse = await browseProductsResponse({ userMessage });
                break;

            // Order intents
            case 'order.status':
                botResponse = await orderStatusResponse({ session, userId: payload.userId, explicitOrderId });
                break;
            case 'order.cancel':
                botResponse = await orderCancelResponse({ session, userId: payload.userId, explicitOrderId });
                break;
            case 'order.return':
                botResponse = await orderReturnResponse({ session, userId: payload.userId, explicitOrderId });
                break;
            case 'order.address':
                botResponse = addressResponse({ session });
                break;
            case 'order.refund':
                botResponse = refundResponse({ session });
                break;

            // Marketing & catalog
            case 'marketing.offer':
                botResponse = marketingResponse();
                break;
            case 'catalog.gifting':
                botResponse = await giftingResponse({ userMessage });
                break;

            // Support
            case 'support.agent':
                botResponse = supportEscalationResponse(session);
                break;
            case 'support.issue':
                botResponse = await issueResponse({ session, rawMessage: userMessage });
                break;

            default:
                // Try product search as fallback for unknown queries
                const searchAttempt = await productSearchResponse({ userMessage });
                if (searchAttempt.payload?.products?.length > 0) {
                    botResponse = searchAttempt;
                } else {
                    botResponse = generalResponse();
                }
        }

        const currentContext = session.context && typeof session.context.toObject === 'function'
            ? session.context.toObject()
            : session.context;

        session.context = {
            ...(currentContext || {}),
            lastIntent: botResponse.intent || intent,
            ...(botResponse.contextUpdates || {}),
            quickReplies: botResponse.suggestions || BASE_SUGGESTIONS
        };

        session.messages.push({
            sender: 'agent',
            message: botResponse.reply,
            intent: botResponse.intent || intent,
            payload: botResponse.payload
        });

        session.messages = trimMessages(session.messages);
        await session.save();

        res.status(200).json({
            success: true,
            session,
            reply: botResponse.reply,
            suggestions: session.context.quickReplies
        });
    } catch (error) {
        console.error('Chatbot message error:', error);
        res.status(500).json({ success: false, message: 'Unable to process that message right now.' });
    }
};

export const closeChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await ChatSession.findOneAndUpdate(
            { sessionId },
            { status: 'closed' },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to close session.' });
    }
};
