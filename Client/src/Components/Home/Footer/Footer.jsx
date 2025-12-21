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
  FaApple,
  FaGooglePlay
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";

function Footer() {
  const trustFeatures = [
    { icon: <LiaShippingFastSolid />, title: "Free Shipping", desc: "On orders over ₹999" },
    { icon: <LiaUndoAltSolid />, title: "Easy Returns", desc: "30-day return policy" },
    { icon: <LiaShieldAltSolid />, title: "Secure Payment", desc: "100% protected" },
    { icon: <LiaGiftSolid />, title: "Premium Packaging", desc: "Gift wrapping available" },
    { icon: <LiaHeadsetSolid />, title: "24/7 Support", desc: "Expert assistance" },
  ];

  const footerLinks = {
    shop: ["New Arrivals", "Best Sellers", "Gift Cards", "Sale", "Corporate Gifts"],
    company: ["Our Story", "Careers", "Press", "Terms & Conditions", "Privacy Policy"],
    support: ["Track Order", "Returns & Exchanges", "Shipping Info", "FAQs", "Contact Us"]
  };

  return (
    <footer className="bg-slate-950 text-slate-300 font-sans mt-auto">

      {/* 1. Trust Indicators - Clean & Minimal */}
      <div className="border-b border-slate-800/60 bg-slate-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 py-8">
            {trustFeatures.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group cursor-default">
                <div className="text-3xl mb-3 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              {/* Logo Placeholder */}
              <h2 className="text-3xl font-bold text-white tracking-tight">
                GiftsNGifts<span className="text-indigo-500">.</span>
              </h2>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Curating the world's finest gifts for every occasion. We believe in the art of giving and the joy of receiving.
            </p>

            {/* Contact Box */}
            <div className="pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Need Help?</p>
              <p className="text-xl font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer">
                +91 9876 543 210
              </p>
              <p className="text-sm text-slate-500 mt-1">Mon - Fri: 9:00 - 20:00</p>
            </div>

            {/* App Badges */}
            <div className="flex gap-3 pt-2">
              <button className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 transition-all">
                <FaApple className="text-xl text-white" />
                <div className="text-left leading-none">
                  <span className="block text-[10px] text-slate-400">Download on the</span>
                  <span className="text-xs font-bold text-white">App Store</span>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 transition-all">
                <FaGooglePlay className="text-lg text-white" />
                <div className="text-left leading-none">
                  <span className="block text-[10px] text-slate-400">Get it on</span>
                  <span className="text-xs font-bold text-white">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Links Columns (Span 2 each) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 block hover:translate-x-1 transform">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 block hover:translate-x-1 transform">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (Span 4) */}
          <div className="lg:col-span-4 pl-0 lg:pl-8">
            <div className="bg-indigo-900/10 rounded-2xl p-6 border border-indigo-500/10">
              <h4 className="text-white font-bold text-lg mb-2">Join Our Newsletter</h4>
              <p className="text-sm text-slate-400 mb-6">
                Sign up for exclusive offers, original stories, activist awareness, and more.
              </p>

              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder:text-slate-600 transition-all"
                  />
                </div>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: '#6366f1', // Indigo-500
                    textTransform: 'none',
                    py: 1.2,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#4f46e5', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }
                  }}
                >
                  Subscribe Now
                </Button>

                <div className="-ml-3">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        sx={{
                          color: '#64748b',
                          '&.Mui-checked': { color: '#6366f1' }
                        }}
                      />
                    }
                    label={
                      <span className="text-xs text-slate-500">
                        I agree to the <Link to="/" className="underline hover:text-indigo-400">Privacy Policy</Link>
                      </span>
                    }
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-slate-800/60 bg-slate-950">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            {/* Copyright */}
            <div className="text-xs text-slate-500 font-medium order-2 md:order-1">
              © 2025 Gifts n Gifts Inc. All rights reserved.
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 order-1 md:order-2">
              {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, idx) => (
                <Link
                  key={idx}
                  to="/"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  <Icon size={14} />
                </Link>
              ))}
            </div>

            {/* Payments */}
            <div className="order-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              <img
                src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg"
                alt="Payment Methods"
                className="h-4 md:h-5"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;