import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import api from "../../utils/api";
import LeftFilter from "./LeftFilter";

function ProductList() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const categoryFromState = location.state?.category;
  const category = categoryFromUrl || categoryFromState || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryName, setActiveCategoryName] = useState(category || "All Products");

  useEffect(() => {
    document.title = `${activeCategoryName} | GiftNgift`;
  }, [activeCategoryName]);

  useEffect(() => {
    if (category) setActiveCategoryName(category);
    else setActiveCategoryName("All Products");

    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/client/productsbycategory");
        if (data.success && Array.isArray(data.categories)) {
          if (category) {
            const categoryData = data.categories.find((cat) => cat.category === category);
            const approved = categoryData?.products?.filter((p) => p.approved) || [];
            setProducts(approved);
          } else {
            const allProducts = data.categories.flatMap((cat) => cat.products).filter((p) => p.approved);
            setProducts(allProducts);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  const applyFilters = async (appliedFilters) => {
    setLoading(true);
    try {
      const categoryResponse = await api.get("/api/getcategories");
      const allCategories = categoryResponse.data;

      if (appliedFilters.selectedCategories.length > 0) {
        const selectedId = appliedFilters.selectedCategories[0];
        const selectedCat = allCategories.find((cat) => cat._id === selectedId);
        if (selectedCat) setActiveCategoryName(selectedCat.categoryname);
      }

      const response = await api.get("/api/product/filter", {
        params: {
          categoryname: appliedFilters.selectedCategories.join(","),
          minPrice: appliedFilters.priceRange[0],
          maxPrice: appliedFilters.priceRange[1],
          discount: appliedFilters.selectedDiscount || "",
          sort: appliedFilters.sort,
        },
      });
      setProducts(response.data.data);
    } catch (error) {
      console.log("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans antialiased">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* --- Header Section --- */}
        <header className="mb-5">
          <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
            <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Collections</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-2 sm:pb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight capitalize mb-2">
                {activeCategoryName}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                Discover <span className="text-purple-600 font-bold">{products.length}</span> curated pieces
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-10">
          {/* --- Sidebar --- */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white  border border-slate-100 shadow-sm">
              <LeftFilter onApplyFilters={applyFilters} />
            </div>
          </aside>

          {/* --- Product Grid --- */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded aspect-[4/5] shadow-sm border border-slate-100" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <Link
                    to={`/products/${product._id}`}
                    key={product._id}
                    className="group flex flex-col bg-white p-3 rounded-[2rem] border border-slate-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 ease-out"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-slate-50">
                      <img
                        src={product?.images?.[0]?.url || "/default-image.jpg"}
                        alt={product?.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      />
                      
                      {/* Floating Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 pb-1 rounded-full shadow-sm">
                          <p className="text-[10px] font-black pt-3 text-purple-600  ">New Arrival</p>
                        </div>
                      </div>

                      
                    </div>

                    {/* Details Container */}
                    <div className="mt-5 px-3 pb-2">
                      <h3 className="text-slate-800  text-base font-bold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-purple-700 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-gray-700 py-2 text-centertext-sm font-bold tracking-tight">₹{product.price}</p>
                      
                      <div className="border-t border-slate-50 flex items-center justify-between">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                           Explore
                         </span>
                         <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                           </svg>
                         </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters to find your match.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;