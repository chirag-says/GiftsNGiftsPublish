import React from "react";
import { LiaShippingFastSolid, LiaGiftSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { RiSecurePaymentLine } from "react-icons/ri";
import { BiSupport } from "react-icons/bi";
import { IoChatboxOutline } from "react-icons/io5";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button, Checkbox, FormControlLabel } from "@mui/material";

function Footer() {
  const trustFeatures = [
    { icon: <LiaShippingFastSolid />, title: "Free Shipping", desc: "Orders over ₹100" },
    { icon: <PiKeyReturnLight />, title: "30 Days Returns", desc: "Easy exchanges" },
    { icon: <RiSecurePaymentLine />, title: "Secured Payment", desc: "100% Safe Checkout" },
    { icon: <LiaGiftSolid />, title: "Special Gifts", desc: "On first order" },
    { icon: <BiSupport />, title: "Support 24/7", desc: "Contact us anytime" },
  ];

  return (
    <footer className="bg-[#111827] text-gray-300 mt-12 transition-all">
      {/* 1. Trust Bar - Icons Row */}
      <div className="container mx-auto px-4 border-b border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12">
          {trustFeatures.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="text-4xl mb-4 text-gray-400 group-hover:text-[#a855f7] transition-all duration-300 transform group-hover:-translate-y-1">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Contact */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight italic">Gifts n Gifts</h2>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-400">
                Union Trade Center, India.<br />
                Your premier destination for thoughtful curated gifts for every occasion.
              </p>
              <div className="pt-2">
                <span className="block text-[10px] uppercase text-gray-500 font-black mb-1">Customer Support</span>
                <p className="text-[#a855f7] text-2xl font-bold tracking-tighter italic">(+91) 9876-543-210</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-2xl border border-gray-800 w-fit">
                <IoChatboxOutline className="text-3xl text-[#a855f7]" />
                <div className="text-xs">
                  <p className="font-bold text-white">Expert Live Chat</p>
                  <p className="text-gray-500">Avg. response: 5 mins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em] border-l-4 border-[#7d0492] pl-4">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              {["Terms & Conditions", "Privacy Policy", "Refund Policy", "Disclaimer"].map((text, i) => (
                <li key={i}>
                  <Link to="/" className="hover:text-[#a855f7] transition-colors flex items-center gap-2 group text-gray-400">
                    <span className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-[#a855f7] rounded-full transition-colors"></span> {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="text-white font-bold mb-8 uppercase text-xs tracking-[0.2em] border-l-4 border-[#7d0492] pl-4">Services</h4>
            <ul className="space-y-4 text-sm font-medium">
              {["Shipping Info", "Support Policy", "FAQs", "Bulk Orders", "Order Tracking"].map((text, i) => (
                <li key={i}>
                  <Link to="/" className="hover:text-[#a855f7] transition-colors flex items-center gap-2 group text-gray-400">
                    <span className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-[#a855f7] rounded-full transition-colors"></span> {text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Card */}
          <div className="bg-gray-800/30 p-8 rounded-3xl border border-gray-800 shadow-inner">
            <h4 className="text-white font-bold mb-2">Exclusive Deals</h4>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">Be the first to know about new arrivals and festive discounts.</p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/50 text-sm text-white placeholder:text-gray-600 transition-all"
              />
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#374151', '&.Mui-checked': { color: '#a855f7' } }} defaultChecked />}
                label={<span className="text-[10px] text-gray-500 font-medium">I agree to the privacy policy</span>}
              />
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  bgcolor: '#7d0492', 
                  py: 1.5, 
                  borderRadius: '12px', 
                  fontWeight: '900', 
                  boxShadow: '0 10px 15px -3px rgba(125, 4, 146, 0.3)',
                  '&:hover': { bgcolor: '#6b037d', transform: 'translateY(-1px)' } 
                }}
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Bottom Credits Bar */}
      <div className="bg-[#0b0f1a] py-10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Social Media Pills */}
          <div className="flex gap-4">
            {[FaFacebookF, FaTwitter, FaInstagram, FaYoutube].map((Icon, idx) => (
              <Link
                key={idx}
                to="/"
                className="w-11 h-11 bg-gray-800/50 hover:bg-[#7d0492] text-white flex items-center justify-center rounded-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>

          <div className="text-center lg:text-left">
             <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-1">
              © 2025 Gifts n Gifts India
            </p>
            <p className="text-[11px] text-gray-500 font-medium italic">
              Crafted for Every Joyous Occasion
            </p>
          </div>

          {/* High Quality White Payment Icons */}
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <img
              src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg"
              alt="Secure Payment Methods"
              className="h-5 opacity-60 grayscale brightness-200"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;