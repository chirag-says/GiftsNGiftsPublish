import React, { useContext, useState } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import image from "../../assets/helloAdmin.jpg"; // Ensure this image has a transparent bg for best effect
import { FiPlus, FiBarChart2 } from "react-icons/fi";
import DashBordBox from "../../Components/DashbordBoxes/DashBordBox.jsx";
import { MyContext } from "../../App.jsx";
import OrdersList from "../Orders Pages/OrdersList.jsx";

function DashBoard() {
  const { setIsOpenAddProductPanel } = useContext(MyContext);
  
  return (
    <div className="space-y-4 pb-10">
      
      {/* 1. Stats Section */}
      <DashBordBox />

      {/* 2. Welcome/Banner Section */}
      <div className="w-full relative overflow-hidden rounded-2xl shadow-xl shadow-indigo-100">
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 z-0"></div>
        
        {/* Decorative Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-purple-400 opacity-20 rounded-full blur-2xl translate-y-1/2"></div>

        <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between p-8 md:p-12">
            
          {/* Text Content */}
          <div className="text-center md:text-left text-white max-w-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              Welcome Back, Admin! 👋
            </h1>
            <p className="text-indigo-100 text-lg mb-8 font-light leading-relaxed">
              Your store is performing well today. Check your daily reports and manage your inventory efficiently.
            </p>
            
            <div className="flex gap-4 justify-center md:justify-start">
               <Link to="/report" style={{ textDecoration: "none" }}>
                <Button 
                    variant="contained" 
                    style={{
                        backgroundColor: "white",
                        color: "#4f46e5",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        padding: "10px 24px",
                        textTransform: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                    startIcon={<FiBarChart2 />}
                >
                  View Reports
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Section */}
          <div className="mb-6 md:mb-0 relative group">
             {/* If you have a PNG illustration, it looks best here. If JPG, adding a border radius helps */}
            <img 
                src={image} 
                alt="Admin Welcome" 
                className="w-[200px] md:w-[280px] object-cover drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" 
                style={{ mixBlendMode: 'normal' }} // Change to 'multiply' if image has white bg
            />
          </div>
        </div>
      </div>

      {/* 3. Orders List Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
         {/* You can wrap OrdersList to give it a card container */}
         <OrdersList />
      </div>

    </div>
  );
}

export default DashBoard;