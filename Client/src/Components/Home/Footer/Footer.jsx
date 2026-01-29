import React from "react";
import {
  LiaShippingFastSolid,
  LiaGiftSolid,
  LiaUndoAltSolid,
  LiaShieldAltSolid,
  LiaHeadsetSolid
} from "react-icons/lia";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";

function Footer() {
  const trustFeatures = [
    { icon: <LiaShippingFastSolid />, title: "Free Shipping", desc: "On orders over ₹999" },
    { icon: <LiaUndoAltSolid />, title: "Easy Returns", desc: "30-day return policy" },
    { icon: <LiaShieldAltSolid />, title: "Secure Payment", desc: "100% protected" },
    { icon: <LiaGiftSolid />, title: "Premium Packaging", desc: "Authentic eco-wrap" },
    { icon: <LiaHeadsetSolid />, title: "24/7 Support", desc: "Expert assistance" },
  ];

  const footerLinks = {
    shop: ["Naga Handlooms", "Bamboo Crafts", "Assam Silk", "Traditional Jewelry", "Corporate Gifts"],
    company: ["Our Story", "Artisan Impact", "Press", "Terms & Conditions", "Privacy Policy"],
    support: ["Track Order", "Returns & Exchanges", "Shipping Info", "FAQs", "Contact Us"]
  };

  return (
    <footer className="bg-[#fcfcf9] text-slate-700 font-sans mt-auto border-t border-stone-200">

      {/* 1. Trust Indicators - Earthy Style */}
      <div className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-10">
            {trustFeatures.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group cursor-default">
                <div className="text-3xl mb-3 text-amber-700/80 group-hover:-translate-y-1 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-tight">{item.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              {/* Logo matches the Serif font in your banners */}
              <h2 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                GiftsNGifts<span className="text-amber-600">.</span>
              </h2>
            </Link>
            <p className="text-stone-600 text-[15px] leading-relaxed max-w-sm italic">
              "Bringing the soul of North East India to your doorstep. Every piece tells a story of tradition, craft, and the hands that made it."
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Connect with us</p>
              <div className="flex gap-3">
                {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, idx) => (
                  <Link
                    key={idx}
                    to="/"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-800 hover:text-white transition-all duration-300"
                  >
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-stone-900 font-bold uppercase text-xs tracking-widest mb-6 border-b border-amber-200 pb-2 inline-block">Shop</h4>
            <ul className="space-y-3 text-[14px]">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link to="/" className="text-stone-500 hover:text-amber-700 transition-colors duration-200 block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-stone-900 font-bold uppercase text-xs tracking-widest mb-6 border-b border-amber-200 pb-2 inline-block">Company</h4>
            <ul className="space-y-3 text-[14px]">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link to="/" className="text-stone-500 hover:text-amber-700 transition-colors duration-200 block">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column - Clean & Organic */}
          <div className="lg:col-span-4">
            <div className="bg-stone-100/50 rounded-2xl p-8 border border-stone-200">
              <h4 className="text-stone-900 font-serif text-xl font-bold mb-2">Join the Tribe</h4>
              <p className="text-sm text-stone-600 mb-6 font-light">
                Subscribe to receive updates on new artisan collections and cultural stories.
              </p>

              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-md focus:outline-none focus:border-stone-800 text-sm transition-all"
                />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#44403c', // Stone-800
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    py: 1.5,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1c1917', boxShadow: 'none' }
                  }}
                >
                  Subscribe
                </Button>

                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      sx={{
                        color: '#a8a29e',
                        '&.Mui-checked': { color: '#78350f' }
                      }}
                    />
                  }
                  label={
                    <span className="text-[11px] text-stone-500 leading-none">
                      I agree to the <Link to="/" className="underline hover:text-stone-800">Privacy Policy</Link>
                    </span>
                  }
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:row justify-between items-center gap-4">
            <div className="text-[11px] text-stone-400 font-medium tracking-wider uppercase">
              © 2026 GiftsnGifts Inc. • Handcrafted with love in North East India
            </div>
            
            <div className="flex items-center gap-6 grayscale opacity-60">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Safe Payments:</p>
                <img
                  src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg"
                  alt="Payment Methods"
                  className="h-3.5"
                />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;