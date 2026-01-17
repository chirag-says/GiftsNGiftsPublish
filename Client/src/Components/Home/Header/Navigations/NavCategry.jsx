import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../../../utils/api";
import { GoTriangleDown, GoChevronRight } from "react-icons/go";

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
    <div className="lg:col-span-7 border-b hidden lg:block border-t border-gray-100">
      {/* Outer wrapper handles horizontal scroll. 
          Note: nested menus in scrollable areas can be tricky; 
          we ensure 'overflow-y-visible' so the menus can drop down.
      */}
      <div className="overflow-x-auto overflow-y-visible no-scrollbar w-full">
        <ul className="flex items-center justify-start lg:justify-center whitespace-nowrap min-w-max px-4">
          {categories.map((cat) => (
            <li key={cat._id} className="relative group xl:px-3 inline-block">
              {/* Main Category Link */}
              <Link to="/productlist" state={{ category: cat.categoryname, categoryId: cat._id }}>
                <Button
                  className="!text-black !text-[13px] hover:!text-[#7d0492] flex items-center gap-1"
                  style={{ textTransform: "capitalize", padding: "12px 15px" }}
                >
                  {cat.categoryname}
                  <GoTriangleDown className="text-base" />
                </Button>
              </Link>

              {/* LEVEL 2: Submenu */}
              <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[999]">
                <div className="min-w-[220px] bg-white shadow-xl border border-gray-100 rounded-lg py-2">
                  <ul className="flex flex-col">
                    {(subcategoriesByCategory[cat._id] || []).map((subcat) => (
                      <li key={subcat._id} className="relative group/sub px-2">
                        <Link
                          to="/productlist"
                          state={{
                            category: cat.categoryname,
                            subcategory: subcat.subcategory,
                            subcategoryId: subcat._id
                          }}
                          className="text-[14px] text-gray-600 hover:bg-gray-50 hover:text-[#7d0492] flex justify-between items-center px-4 py-2 rounded-md transition-all"
                        >
                          {subcat.subcategory}
                          {/* Chevron indicates Level 3 exists */}
                          {subcat.children?.length > 0 && (
                            <GoChevronRight className="ml-2 text-gray-400" />
                          )}
                        </Link>

                        {/* LEVEL 3: Nested Submenu (Opens to the right) */}
                        {subcat.children && subcat.children.length > 0 && (
                          <div className="absolute top-0 left-full ml-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                            <div className="min-w-[200px] bg-white shadow-xl border border-gray-100 rounded-lg py-2">
                              <ul className="flex flex-col">
                                {subcat.children.map((child) => (
                                  <li key={child._id} className="px-2">
                                    <Link
                                      to="/productlist"
                                      className="text-[13px] text-gray-500 hover:bg-gray-50 hover:text-[#7d0492] block px-4 py-2 rounded-md"
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NavCategory;