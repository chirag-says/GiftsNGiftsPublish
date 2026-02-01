/**
 * Trust Bar Component
 * Slim horizontal bar before footer showing trust signals
 * Features: Secure Payments, Easy Returns, Safe Packaging, WhatsApp Support
 */
import React from "react";
import { HiShieldCheck, HiRefresh, HiCube, HiChat } from "react-icons/hi";

const TrustBar = () => {
    const trustItems = [
        {
            icon: <HiShieldCheck className="w-5 h-5" />,
            text: "Secure Payments",
            subtext: "100% secure checkout"
        },
        {
            icon: <HiRefresh className="w-5 h-5" />,
            text: "Easy Returns",
            subtext: "7-day return policy"
        },
        {
            icon: <HiCube className="w-5 h-5" />,
            text: "Safe Packaging",
            subtext: "Premium gift wrapping"
        },
        {
            icon: <HiChat className="w-5 h-5" />,
            text: "WhatsApp Support",
            subtext: "10 AM - 7 PM IST"
        }
    ];

    const handleWhatsAppClick = () => {
        const phoneNumber = "919876543210"; // Replace with actual number
        const message = encodeURIComponent("Hi! I need help with my order on GiftsNGifts.");
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    };

    return (
        <div className="bg-gradient-to-r from-[#2C1A0F] to-[#3A2518] py-4 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {trustItems.map((item, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 justify-center md:justify-start 
                                ${index === 3 ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                            onClick={index === 3 ? handleWhatsAppClick : undefined}
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#d4af37]/20 
                                flex items-center justify-center text-[#d4af37]">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{item.text}</p>
                                <p className="text-white/60 text-xs">{item.subtext}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustBar;
