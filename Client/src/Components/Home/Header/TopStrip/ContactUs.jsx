import React from "react";
import { MdEmail, MdPhone, MdLocationOn, MdChat } from "react-icons/md";

const ContactUs = () => {
  const contactCards = [
    { icon: <MdEmail />, title: "Email Us", detail: "sales@giftNgifts.com", desc: "Response within 24 hours" },
    { icon: <MdPhone />, title: "Call Us", detail: "+91 9999-999-999", desc: "Mon-Sat, 9AM-6PM" },
    { icon: <MdLocationOn />, title: "Visit Us", detail: "Union Trade Center", desc: "India Support Store" },
    { icon: <MdChat />, title: "Live Chat", detail: "Active Now", desc: "Chat with an expert" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Let's start a <span className="text-[#7d0492]">Conversation</span></h1>
        <p className="text-gray-500">Have a question or feedback? We're here to help you make your gifting experience perfect.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactCards.map((card, i) => (
          <div key={i} className="group p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-purple-50 text-[#7d0492] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#7d0492] group-hover:text-white transition-colors">
              {card.icon}
            </div>
            <h3 className="text-lg font-bold mb-1">{card.title}</h3>
            <p className="text-[#7d0492] font-medium text-sm mb-2">{card.detail}</p>
            <p className="text-gray-400 text-xs">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactUs;