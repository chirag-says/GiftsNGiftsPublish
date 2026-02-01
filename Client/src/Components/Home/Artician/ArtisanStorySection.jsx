import React from "react";
import { Link } from "react-router-dom";
// Import the artisan image as provided in your assets
import artisanImg from "../../../assets/roshni/artician.png";

const ArtisanStorySection = () => {
  return (
    <section className="bg-[#fdfcfb] py-20 md:py-15 px-6 relative overflow-hidden">
      {/* Subtle Background Texture - Editorial Paper Feel */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT – ARTISAN IMAGE WITH GALLERY FRAME */}
          <div className="relative group">
            {/* Decorative Offset Frame behind the image */}
            <div className="absolute -inset-4 border border-[#d4af37]/20 rounded-3xl translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out" />

            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={artisanImg}
                alt="Muga Silk Weaver from Assam"
                className="w-full h-auto object-cover transform transition-transform duration-[2000ms] group-hover:scale-105"
              />
              {/* Subtle Overlay to make the quote card pop */}
              <div className="absolute inset-0 bg-black/5" />
            </div>

            {/* EDITORIAL QUOTE CARD - Glassmorphism style */}
            <div className="absolute -bottom-10 -right-4 md:-right-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 max-w-[280px] md:max-w-xs border border-white/20 transform transition-transform duration-500 hover:-translate-y-2">
              <div className="w-8 h-[1px] bg-[#d4af37] mb-4" />
              <p className="text-sm md:text-base italic text-[#4a3728] leading-relaxed font-serif">
                “Every thread I weave carries the wisdom of my ancestors. It is not just silk; it is our identity.”
              </p>
              <div className="mt-6">
                <p className="font-serif font-bold text-[#332a21]">Lakshmi Devi</p>
                <p className="text-[10px] md:text-xs text-[#d4af37] uppercase tracking-[0.2em] font-bold mt-1">
                  Muga Silk Weaver, Assam
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT – STORY CONTENT */}
          <div className="flex flex-col space-y-8">
            {/* Boutique Eyebrow */}
            <div className="flex items-center gap-4">
              <span className="h-[1px] w-8 bg-[#d4af37]" />
              <p className="text-[#d4af37] text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">
                their stories, your gift
              </p>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#332a21] leading-tight tracking-tight">
              Meet the <span className="italic font-light text-[#b39055]">Makers</span>
            </h2>

            <div className="space-y-6 text-[#6b5a4c] text-sm md:text-base leading-relaxed font-light">
              <p>
                Every gift you choose supports a living culture and the families who sustain it.
                In the quiet corners of <span className="font-medium text-[#332a21] border-b border-[#d4af37]/30">North East India</span>, traditions are not just taught; they are lived.
              </p>

              <p>
                From the golden <span className="italic">Muga silk</span> of Assam to the resilient bamboo of Meghalaya, each piece is a vessel for centuries of identity. When you choose GiftsnGifts, you aren't just buying an object; you're becoming a custodian of heritage.
              </p>
            </div>

            {/* STATS SECTION - Highlighting Impact */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#d4af37]/20">
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-serif text-[#b39055]">500+</p>
                <p className="text-[10px] uppercase tracking-widest text-[#6b5a4c]/70 font-bold">Artisans</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-serif text-[#b39055]">8</p>
                <p className="text-[10px] uppercase tracking-widest text-[#6b5a4c]/70 font-bold">States</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-serif text-[#b39055]">50k+</p>
                <p className="text-[10px] uppercase tracking-widest text-[#6b5a4c]/70 font-bold">Stories Sent</p>
              </div>
            </div>

            {/* CTA - Refined Boutique Style */}
            <div className="pt-6">
              <Link
                to="/artisans"
                className="group relative inline-block px-8 py-4 overflow-hidden rounded-full border border-[#332a21] text-[#332a21] transition-all duration-500 hover:text-white"
              >
                <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em]">
                  Read Their Stories
                </span>
                <div className="absolute inset-0 bg-[#332a21] translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ArtisanStorySection;