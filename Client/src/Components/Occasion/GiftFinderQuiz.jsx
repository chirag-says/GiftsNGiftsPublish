/**
 * Gift Finder Quiz
 * Interactive 5-step quiz to recommend perfect gifts
 * Premium design with animations and progress tracking
 */
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiArrowRight, HiArrowLeft, HiRefresh, HiSparkles,
    HiStar, HiShoppingCart, HiCheck, HiGift, HiLightningBolt
} from "react-icons/hi";
import api from "../../utils/api";

// Quiz Questions
const questions = [
    {
        id: 'recipient',
        title: 'Who are you gifting to?',
        subtitle: 'This helps us match the right price range and style',
        options: [
            { id: 'high-value-clients', label: 'High-value Clients', desc: 'VIP treatment', icon: '👑', color: 'from-amber-500 to-orange-500' },
            { id: 'regular-clients', label: 'Regular Clients', desc: 'Professional touch', icon: '🏢', color: 'from-blue-500 to-indigo-500' },
            { id: 'employees', label: 'Employees', desc: 'Team appreciation', icon: '👔', color: 'from-green-500 to-emerald-500' },
            { id: 'partners', label: 'Business Partners', desc: 'Mutual respect', icon: '🤝', color: 'from-purple-500 to-violet-500' },
            { id: 'mixed', label: 'Mixed Group', desc: 'Various recipients', icon: '👥', color: 'from-slate-500 to-slate-600' }
        ]
    },
    {
        id: 'budget',
        title: "What's your budget per gift?",
        subtitle: 'We have options for every budget',
        options: [
            { id: 'under-500', label: 'Under ₹500', desc: 'Budget-friendly', icon: '💰', color: 'from-green-500 to-emerald-500' },
            { id: '500-1000', label: '₹500 - ₹1,000', desc: 'Great value', icon: '💵', color: 'from-teal-500 to-cyan-500' },
            { id: '1000-2500', label: '₹1,000 - ₹2,500', desc: 'Mid-range', icon: '💎', color: 'from-blue-500 to-indigo-500' },
            { id: '2500-5000', label: '₹2,500 - ₹5,000', desc: 'Premium', icon: '👑', color: 'from-amber-500 to-orange-500' },
            { id: '5000-plus', label: '₹5,000+', desc: 'Luxury', icon: '✨', color: 'from-purple-500 to-pink-500' }
        ]
    },
    {
        id: 'quantity',
        title: 'How many gifts do you need?',
        subtitle: 'Bulk orders get bigger discounts',
        options: [
            { id: '1-25', label: '1-25 units', desc: 'Small batch', icon: '📦', color: 'from-slate-500 to-slate-600' },
            { id: '25-50', label: '25-50 units', desc: '5% discount', icon: '📦', color: 'from-green-500 to-emerald-500' },
            { id: '50-100', label: '50-100 units', desc: '10% discount', icon: '📦', color: 'from-blue-500 to-indigo-500' },
            { id: '100-500', label: '100-500 units', desc: '15% discount', icon: '📦', color: 'from-amber-500 to-orange-500' },
            { id: '500-plus', label: '500+ units', desc: '20% discount', icon: '📦', color: 'from-purple-500 to-pink-500' }
        ]
    },
    {
        id: 'dietary',
        title: 'Any dietary considerations?',
        subtitle: 'For food & beverage gifts',
        options: [
            { id: 'no-restriction', label: 'No Restrictions', desc: 'All products', icon: '🍽️', color: 'from-green-500 to-emerald-500' },
            { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat products', icon: '🥬', color: 'from-lime-500 to-green-500' },
            { id: 'vegan', label: 'Vegan', desc: 'Plant-based only', icon: '🌱', color: 'from-emerald-500 to-teal-500' },
            { id: 'skip', label: 'Not buying food', desc: 'Skip this', icon: '⏭️', color: 'from-slate-400 to-slate-500' }
        ]
    },
    {
        id: 'preference',
        title: 'What type of gift do you prefer?',
        subtitle: 'Help us narrow down the perfect match',
        options: [
            { id: 'practical', label: 'Practical', desc: 'Useful everyday items', icon: '🛠️', color: 'from-blue-500 to-indigo-500' },
            { id: 'decorative', label: 'Decorative', desc: 'Beautiful display pieces', icon: '🏺', color: 'from-amber-500 to-orange-500' },
            { id: 'gourmet', label: 'Gourmet', desc: 'Food & beverages', icon: '🍵', color: 'from-rose-500 to-pink-500' },
            { id: 'mixed', label: 'Mixed Hampers', desc: 'Best of everything', icon: '🎁', color: 'from-purple-500 to-violet-500' }
        ]
    }
];

function GiftFinderQuiz() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState(null);

    const occasion = searchParams.get('occasion') || '';
    const progress = ((currentStep + 1) / questions.length) * 100;
    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;

    const handleSelect = async (optionId) => {
        const newAnswers = { ...answers, [currentQuestion.id]: optionId };
        setAnswers(newAnswers);

        if (isLastStep) {
            // Submit quiz
            await getRecommendations(newAnswers);
        } else {
            // Next question with slight delay for animation
            setTimeout(() => setCurrentStep(currentStep + 1), 200);
        }
    };

    const getRecommendations = async (quizAnswers) => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/gift-finder', {
                ...quizAnswers,
                occasion
            });
            if (res.data.success) {
                setRecommendations(res.data.data);
            }
        } catch (error) {
            console.error('Error getting recommendations:', error);
            // Use sample recommendations for demo
            setRecommendations(getSampleRecommendations());
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setAnswers({});
        setRecommendations(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Premium Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        `}
            </style>

            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6"
                    >
                        <HiGift className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-300 uppercase tracking-wider">
                            Gift Finder Quiz
                        </span>
                    </motion.div>

                    {!recommendations && (
                        <>
                            <motion.h1
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-4xl font-bold text-white mb-4"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {currentQuestion?.title}
                            </motion.h1>
                            <motion.p
                                key={`sub-${currentStep}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-400"
                            >
                                {currentQuestion?.subtitle}
                            </motion.p>
                        </>
                    )}
                </div>

                {/* Progress Bar */}
                {!recommendations && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                            <span>Question {currentStep + 1} of {questions.length}</span>
                            <span>{Math.round(progress)}% complete</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                )}

                {/* Quiz Content */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                            <h3 className="text-xl font-semibold text-white mb-2">Finding your perfect gifts...</h3>
                            <p className="text-slate-400">Analyzing your preferences</p>
                        </motion.div>
                    ) : recommendations ? (
                        <RecommendationsView
                            recommendations={recommendations}
                            onRestart={handleRestart}
                            occasion={occasion}
                        />
                    ) : (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentQuestion?.options.map((option, idx) => (
                                    <motion.button
                                        key={option.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleSelect(option.id)}
                                        className={`group relative p-6 rounded-2xl text-left overflow-hidden transition-all hover:scale-[1.02] ${answers[currentQuestion.id] === option.id
                                                ? 'ring-2 ring-amber-500'
                                                : ''
                                            }`}
                                    >
                                        {/* Background Gradient */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                                        {/* Glass Effect */}
                                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl" />

                                        {/* Content */}
                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-4xl">{option.icon}</span>
                                                {answers[currentQuestion.id] === option.id && (
                                                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                                        <HiCheck className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1">{option.label}</h3>
                                            <p className="text-sm text-slate-400">{option.desc}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-10">
                                <button
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-slate-400 hover:text-white transition ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''
                                        }`}
                                >
                                    <HiArrowLeft className="w-5 h-5" />
                                    Back
                                </button>

                                <button
                                    onClick={handleRestart}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-slate-400 hover:text-white transition"
                                >
                                    <HiRefresh className="w-5 h-5" />
                                    Start Over
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Recommendations View Component
function RecommendationsView({ recommendations, onRestart, occasion }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Success Header */}
            <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <HiSparkles className="w-10 h-10 text-white" />
                </div>
                <h2
                    className="text-3xl font-bold text-white mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Your Perfect Gift Matches
                </h2>
                <p className="text-slate-400">
                    Based on your answers, here are our top recommendations
                </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-6">
                {recommendations.recommendations?.map((product, idx) => (
                    <motion.div
                        key={product._id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                    >
                        {/* Rank Badge */}
                        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-sm font-bold ${idx === 0
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                : idx === 1
                                    ? 'bg-slate-200 text-slate-700'
                                    : 'bg-amber-100 text-amber-700'
                            }`}>
                            {product.label}
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Image */}
                            <div className="md:w-48 aspect-square md:aspect-auto shrink-0">
                                <img
                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/200'}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{product.title}</h3>
                                        {product.state && (
                                            <span className="text-sm text-teal-400">📍 {product.state}</span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">₹{product.price?.toLocaleString()}</div>
                                        {product.bulkPricing && (
                                            <div className="text-sm text-amber-400">₹{product.bulkPricing.tier50} for 50+</div>
                                        )}
                                    </div>
                                </div>

                                {/* Match Score */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                            style={{ width: `${product.matchScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-green-400">{product.matchScore}% match</span>
                                </div>

                                {/* Perfect For Tags */}
                                {product.perfectFor && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {product.perfectFor.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm">
                                                ✓ {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <HiStar
                                                key={i}
                                                className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-amber-400' : 'text-slate-600'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-slate-400">({product.reviewCount || 0} reviews)</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition"
                                    >
                                        <HiShoppingCart className="w-5 h-5" />
                                        View Product
                                    </Link>
                                    <button className="px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition">
                                        Quick View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <button
                    onClick={onRestart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
                >
                    <HiRefresh className="w-5 h-5" />
                    Start Over
                </button>
                <Link
                    to={occasion ? `/occasion/${occasion}` : "/shop-by-occasion"}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-800 font-semibold hover:bg-slate-100 transition"
                >
                    Browse All Gifts
                    <HiArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </motion.div>
    );
}

// Sample recommendations for demo
function getSampleRecommendations() {
    return {
        recommendations: [
            {
                _id: '1',
                title: 'Assam Tea Premium Gift Hamper',
                price: 1299,
                rating: 4.8,
                reviewCount: 24,
                matchScore: 95,
                rank: 'top',
                label: '🏆 TOP MATCH',
                state: 'Assam',
                images: [{ url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400' }],
                perfectFor: ['Clients', 'Senior Employees'],
                bulkPricing: { tier50: 1169, tier100: 1104, tier500: 1039 }
            },
            {
                _id: '2',
                title: 'Muga Silk Designer Scarf',
                price: 2499,
                rating: 4.9,
                reviewCount: 56,
                matchScore: 88,
                rank: 'alternative',
                label: '🥈 GREAT ALTERNATIVE',
                state: 'Assam',
                images: [{ url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400' }],
                perfectFor: ['VIP Clients', 'Partners'],
                bulkPricing: { tier50: 2249, tier100: 2124, tier500: 1999 }
            },
            {
                _id: '3',
                title: 'Northeast Gourmet Spices Box',
                price: 899,
                rating: 4.6,
                reviewCount: 18,
                matchScore: 85,
                rank: 'budget',
                label: '🥉 BUDGET-FRIENDLY',
                state: 'Meghalaya',
                images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' }],
                perfectFor: ['Employees', 'Large Teams'],
                bulkPricing: { tier50: 809, tier100: 764, tier500: 719 }
            }
        ],
        totalMatches: 15
    };
}

export default GiftFinderQuiz;
