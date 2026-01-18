/**
 * Chat Analytics Model
 * Tracks unknown queries, intent performance, and conversation analytics
 * Used for improving the chatbot over time
 */

import mongoose from 'mongoose';

// ============================================
// UNKNOWN/FALLBACK QUERY LOG
// Stores queries that the bot couldn't understand
// ============================================
const unknownQuerySchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    query: {
        type: String,
        required: true
    },
    detectedIntent: {
        type: String,
        default: 'general'
    },
    confidenceScore: {
        type: Number,
        default: 0
    },
    suggestedIntent: {
        type: String
    }, // Admin can manually tag correct intent
    isReviewed: {
        type: Boolean,
        default: false
    },
    addedToTraining: {
        type: Boolean,
        default: false
    },
    metadata: {
        platform: String,
        browser: String,
        locale: String
    }
}, {
    timestamps: true
});

// Index for finding unreviewed queries
unknownQuerySchema.index({ isReviewed: 1, createdAt: -1 });

// ============================================
// INTENT PERFORMANCE LOG
// Tracks how well each intent performs
// ============================================
const intentLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userMessage: {
        type: String,
        required: true
    },
    detectedIntent: {
        type: String,
        required: true,
        index: true
    },
    confidenceScore: {
        type: Number
    },
    matchedPhrase: {
        type: String
    },
    matchedKeywords: [{
        type: String
    }],
    wasSuccessful: {
        type: Boolean
    }, // Did user get what they wanted?
    followUpIntent: {
        type: String
    }, // What did user do next?
    escalatedToHuman: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for analytics queries
intentLogSchema.index({ detectedIntent: 1, createdAt: -1 });
intentLogSchema.index({ wasSuccessful: 1, detectedIntent: 1 });

// ============================================
// CONVERSATION RESOLUTION TRACKING
// Tracks if conversations were resolved successfully
// ============================================
const conversationResolutionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    endedAt: {
        type: Date
    },
    messageCount: {
        type: Number,
        default: 0
    },
    primaryIntent: {
        type: String
    }, // Main thing user wanted
    intentsUsed: [{
        type: String
    }], // All intents triggered
    resolution: {
        type: String,
        enum: ['resolved', 'escalated', 'abandoned', 'ongoing'],
        default: 'ongoing'
    },
    resolutionDetails: {
        orderTracked: { type: Boolean, default: false },
        orderCancelled: { type: Boolean, default: false },
        returnInitiated: { type: Boolean, default: false },
        productFound: { type: Boolean, default: false },
        ticketCreated: { type: Boolean, default: false },
        humanRequested: { type: Boolean, default: false }
    },
    userRating: {
        type: Number,
        min: 1,
        max: 5
    },
    userFeedback: {
        type: String
    },
    durationSeconds: {
        type: Number
    }
}, {
    timestamps: true
});

// ============================================
// POPULAR SEARCH TERMS
// Track what products users search for most
// ============================================
const searchTermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastSearched: {
        type: Date,
        default: Date.now
    },
    resultsFound: {
        type: Number,
        default: 0
    }, // Average results
    conversions: {
        type: Number,
        default: 0
    } // Led to purchase
}, {
    timestamps: true
});

searchTermSchema.index({ count: -1 });
searchTermSchema.index({ term: 'text' });

// ============================================
// DAILY ANALYTICS SUMMARY
// Aggregated daily stats for dashboard
// ============================================
const dailyAnalyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    totalSessions: {
        type: Number,
        default: 0
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    uniqueUsers: {
        type: Number,
        default: 0
    },
    intentBreakdown: {
        type: Map,
        of: Number,
        default: {}
    },
    resolutionRate: {
        type: Number,
        default: 0
    }, // Percentage
    escalationRate: {
        type: Number,
        default: 0
    },
    averageSessionDuration: {
        type: Number,
        default: 0
    }, // Seconds
    topSearchTerms: [{
        term: String,
        count: Number
    }],
    unknownQueryCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Log an unknown query for later review
const logUnknownQuery = async (data) => {
    try {
        const query = new UnknownQuery({
            sessionId: data.sessionId,
            userId: data.userId,
            query: data.query,
            detectedIntent: data.detectedIntent || 'general',
            confidenceScore: data.confidenceScore || 0,
            metadata: data.metadata
        });
        await query.save();
        console.log('[ChatAnalytics] Logged unknown query:', data.query.substring(0, 50));
    } catch (error) {
        console.error('[ChatAnalytics] Error logging unknown query:', error.message);
    }
};

// Log intent detection for analytics
const logIntent = async (data) => {
    try {
        const log = new IntentLog({
            sessionId: data.sessionId,
            userId: data.userId,
            userMessage: data.userMessage,
            detectedIntent: data.detectedIntent,
            confidenceScore: data.confidenceScore,
            matchedPhrase: data.matchedPhrase,
            matchedKeywords: data.matchedKeywords,
            wasSuccessful: data.wasSuccessful,
            followUpIntent: data.followUpIntent,
            escalatedToHuman: data.escalatedToHuman
        });
        await log.save();
    } catch (error) {
        console.error('[ChatAnalytics] Error logging intent:', error.message);
    }
};

// Track or update conversation resolution
const trackConversation = async (sessionId, updates) => {
    try {
        await ConversationResolution.findOneAndUpdate(
            { sessionId },
            {
                $set: updates,
                $setOnInsert: { startedAt: new Date() }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('[ChatAnalytics] Error tracking conversation:', error.message);
    }
};

// Increment message count for a session
const incrementMessageCount = async (sessionId) => {
    try {
        await ConversationResolution.findOneAndUpdate(
            { sessionId },
            {
                $inc: { messageCount: 1 },
                $setOnInsert: { startedAt: new Date() }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('[ChatAnalytics] Error incrementing message count:', error.message);
    }
};

// Track search term usage
const trackSearchTerm = async (term, resultsCount = 0) => {
    try {
        const normalizedTerm = term.toLowerCase().trim();
        if (normalizedTerm.length < 2) return;

        await SearchTerm.findOneAndUpdate(
            { term: normalizedTerm },
            {
                $inc: { count: 1 },
                $set: {
                    lastSearched: new Date(),
                    resultsFound: resultsCount
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('[ChatAnalytics] Error tracking search term:', error.message);
    }
};

// Mark conversation as resolved
const markResolved = async (sessionId, resolutionType, details = {}) => {
    try {
        await ConversationResolution.findOneAndUpdate(
            { sessionId },
            {
                $set: {
                    resolution: resolutionType,
                    endedAt: new Date(),
                    resolutionDetails: details
                }
            }
        );
    } catch (error) {
        console.error('[ChatAnalytics] Error marking resolved:', error.message);
    }
};

// Add intent to session's intent list
const addIntentToSession = async (sessionId, intent, userId = null) => {
    try {
        const update = {
            $addToSet: { intentsUsed: intent },
            $setOnInsert: { startedAt: new Date() }
        };

        if (userId) {
            update.$set = { userId };
        }

        // Set primary intent if this is the first meaningful intent
        const existing = await ConversationResolution.findOne({ sessionId });
        if (!existing?.primaryIntent && !['greeting', 'thanks', 'goodbye', 'general'].includes(intent)) {
            update.$set = { ...update.$set, primaryIntent: intent };
        }

        await ConversationResolution.findOneAndUpdate(
            { sessionId },
            update,
            { upsert: true }
        );
    } catch (error) {
        console.error('[ChatAnalytics] Error adding intent to session:', error.message);
    }
};

// Get top unknown queries (for review)
const getTopUnknownQueries = async (limit = 50) => {
    try {
        return await UnknownQuery.find({ isReviewed: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('[ChatAnalytics] Error fetching unknown queries:', error.message);
        return [];
    }
};

// Get top search terms
const getTopSearchTerms = async (limit = 20) => {
    try {
        return await SearchTerm.find()
            .sort({ count: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        console.error('[ChatAnalytics] Error fetching search terms:', error.message);
        return [];
    }
};

// Get intent performance stats
const getIntentStats = async (days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await IntentLog.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$detectedIntent',
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$confidenceScore' },
                    escalationRate: {
                        $avg: { $cond: ['$escalatedToHuman', 1, 0] }
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);
    } catch (error) {
        console.error('[ChatAnalytics] Error fetching intent stats:', error.message);
        return [];
    }
};

// ============================================
// EXPORTS
// ============================================

export const UnknownQuery = mongoose.model('UnknownQuery', unknownQuerySchema);
export const IntentLog = mongoose.model('IntentLog', intentLogSchema);
export const ConversationResolution = mongoose.model('ConversationResolution', conversationResolutionSchema);
export const SearchTerm = mongoose.model('SearchTerm', searchTermSchema);
export const DailyAnalytics = mongoose.model('DailyAnalytics', dailyAnalyticsSchema);

export {
    logUnknownQuery,
    logIntent,
    trackConversation,
    incrementMessageCount,
    trackSearchTerm,
    markResolved,
    addIntentToSession,
    getTopUnknownQueries,
    getTopSearchTerms,
    getIntentStats
};

export default {
    UnknownQuery,
    IntentLog,
    ConversationResolution,
    SearchTerm,
    DailyAnalytics,
    logUnknownQuery,
    logIntent,
    trackConversation,
    incrementMessageCount,
    trackSearchTerm,
    markResolved,
    addIntentToSession,
    getTopUnknownQueries,
    getTopSearchTerms,
    getIntentStats
};