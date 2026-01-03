import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../../../utils/api";
import { GoTriangleDown } from "react-icons/go";

function NavCategory() {
  const [categories, setCategories] = useState([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/getcategories');
        setCategories(
          Array.isArray(response.data)
            ? response.data
            : response.data.categories || []
        );
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await api.get('/api/getsubcategories');
        const grouped = response.data.reduce((acc, item) => {
          const catId = item.category?._id;
          if (!catId) return acc;
          if (!acc[catId]) acc[catId] = [];
          acc[catId].push(item);
          return acc;
        }, {});
        setSubcategoriesByCategory(grouped);
      } catch (error) {
        console.error("Error fetching subcategories", error);
      }
    };
    fetchSubcategories();
  }, []);

  return (
    <div className="lg:col-span-7 border-b hidden lg:block border-t p-1 border-gray-100">
      <ul className="flex items-center justify-center">
        {categories.map((cat) => (
          <li key={cat._id} className="relative group xl:px-3">
            {/* Main Category Link */}
            <Link to={`/productlist?category=${encodeURIComponent(cat.categoryname)}`}>
              <Button
                className="!text-black !text-[13px] hover:!text-[#7d0492] flex items-center gap-1"
                style={{ textTransform: "capitalize" }}
              >
                {cat.categoryname}
                <GoTriangleDown className="text-base" />
              </Button>
            </Link>

            {/* FIXED SUBMENU: Centered and Polished */}
            <div className="submenu absolute top-full left-50 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
              <div className="min-w-[700px] bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden">
                <ul className="grid grid-cols-4 gap-x-6 gap-y-3 p-8">
                  {(subcategoriesByCategory[cat._id] || []).map((subcat) => (
                    <li key={subcat._id} className="list-none">
                      <Link
                        to={`/productlist?category=${encodeURIComponent(cat.categoryname)}&subcategory=${encodeURIComponent(subcat.subcategory)}`}
                        className="text-[14px] text-gray-500 hover:text-[#7d0492] hover:translate-x-1 font-medium block py-1 transition-all duration-200"
                      >
                        {subcat.subcategory}
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Footer Decoration */}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NavCategory;
