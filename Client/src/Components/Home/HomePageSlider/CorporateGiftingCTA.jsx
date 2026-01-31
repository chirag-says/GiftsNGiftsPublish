/**
 * Corporate Gifting CTA Section
 * Prominent B2B call-to-action for corporate clients
 * Features: Gift finder quiz CTA, bulk orders, key benefits
 */
import React from "react";
import { Link } from "react-router-dom";
import { HiSparkles, HiUserGroup, HiDocumentText, HiLightningBolt, HiArrowRight } from "react-icons/hi";

function CorporateGiftingCTA() {
    return (
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Premium Fonts */}
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        `}
            </style>

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6">
                        <HiSparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                            Corporate Gifting
                        </span>
                    </div>
                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Gifting Made Easy for{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Businesses
                        </span>
                    </h2>
                    <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                        Impress clients and employees with handcrafted Northeast treasures.
                        Bulk discounts, customization, and dedicated support.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { value: '500+', label: 'Corporate Clients' },
                        { value: '10K+', label: 'Orders Delivered' },
                        { value: '100+', label: 'Curated Products' },
                        { value: '4.9★', label: 'Client Rating' }
                    ].map((stat, idx) => (
                        <div key={idx} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* CTA Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* Gift Finder Quiz */}
                    <Link
                        to="/gift-finder"
                        className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/30"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                <HiLightningBolt className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Gift Finder Quiz</h3>
                            <p className="text-white/80 text-sm mb-4">
                                Answer 5 questions, get personalized recommendations in seconds
                            </p>
                            <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                                Start Now <HiArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>

                    {/* Bulk Orders */}
                    <Link
                        to="/bulk-quote"
                        className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                            <HiUserGroup className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Bulk Orders</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Get up to 20% off on orders of 100+ units with customization
                        </p>
                        <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all">
                            Request Quote <HiArrowRight className="w-4 h-4" />
                        </span>
                    </Link>

                    {/* Shop by Occasion */}
                    <Link
                        to="/shop-by-occasion"
                        className="group relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                            <HiDocumentText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Shop by Occasion</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Diwali, New Year, Employee gifts—find the perfect fit
                        </p>
                        <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all">
                            Browse Occasions <HiArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                        GST Invoice
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                        Logo Branding
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                        Pan-India Delivery
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                        Dedicated Support
                    </span>
                </div>
            </div>
        </section>
    );
}

export default CorporateGiftingCTA;
