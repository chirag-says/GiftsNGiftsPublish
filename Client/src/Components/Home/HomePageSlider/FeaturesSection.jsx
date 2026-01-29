import React from 'react';
import { Handshake, Users, Sparkles, Heart } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Handshake strokeWidth={1} className="w-9 h-9 text-[#d4af37]" />,
      title: "authentic & handmade",
      description: "Crafted by master artisans using ancestral techniques that preserve the soul of the craft."
    },
    {
      icon: <Users strokeWidth={1} className="w-9 h-9 text-[#d4af37]" />,
      title: "direct from weavers",
      description: "Empowering communities through fair trade, ensuring every thread supports a sustainable future."
    },
    {
      icon: <Sparkles strokeWidth={1} className="w-9 h-9 text-[#d4af37]" />,
      title: "cultural heritage",
      description: "A celebration of tribal identity, weaving the diverse stories of the Eight Sisters into every gift."
    },
    {
      icon: <Heart strokeWidth={1} className="w-9 h-9 text-[#d4af37]" />,
      title: "thoughtful gifting",
      description: "More than an object—it's a meaningful connection delivered in a box of North Eastern grace."
    }
  ];

  return (
    <section className="py-16 bg-[#fdfcfb] px-6 relative overflow-hidden">
      {/* Premium Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
      
      {/* Decorative Blur Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-[1px] w-12 bg-[#d4af37]/40" />
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.5em] font-bold">
              The GiftsnGifts Promise
            </span>
            <span className="h-[1px] w-12 bg-[#d4af37]/40" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif text-[#332a21] mb-8 tracking-tight">
            Why North East Gifts?
          </h2>
          
          <p className="text-[#6b5a4c] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-serif italic opacity-90">
            "Every piece tells a story, and every story carries a legacy."
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white p-10 rounded-2xl transition-all duration-700 hover:shadow-[0_30px_60px_rgba(212,175,87,0.08)] border border-transparent hover:border-[#d4af37]/10 flex flex-col items-center text-center overflow-hidden"
            >
              {/* Floating Background Accent */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#fdfaf5] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Icon Section: "Artisan Seal" Style */}
              <div className="relative mb-10">
                <div className="w-20 h-20 flex items-center justify-center rounded-full border border-[#d4af37]/20 relative z-10 transition-transform duration-700 group-hover:rotate-[360deg]">
                  {feature.icon}
                </div>
                {/* Expanding Ring on Hover */}
                <div className="absolute inset-0 scale-75 group-hover:scale-125 border border-[#d4af37]/5 rounded-full transition-all duration-700 ease-out" />
              </div>

              {/* Text Content */}
              <h3 className="relative z-10 text-xl font-serif text-[#332a21] mb-4 tracking-wide group-hover:text-[#b39055] transition-colors duration-300 capitalize">
                {feature.title}
              </h3>
              
              <div className="relative z-10 w-6 h-[1.5px] bg-[#d4af37]/40 mb-6 group-hover:w-16 transition-all duration-500" />

              <p className="relative z-10 text-[#6b5a4c] text-sm leading-relaxed font-light tracking-wide px-2 opacity-80 transition-opacity group-hover:opacity-100">
                {feature.description}
              </p>

              {/* Minimalist Corner Detail */}
              <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-[#d4af37]/5 rounded-tl-full scale-0 group-hover:scale-100 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom Decorative Divider */}
        <div className="mt-24 flex items-center justify-center gap-4 opacity-30">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <div className="w-1.5 h-1.5 rotate-45 border border-[#d4af37]" />
          <div className="h-[1px] w-32 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;