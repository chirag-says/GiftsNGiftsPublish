import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import api from "../../utils/api";
import LeftFilter from "./LeftFilter";

function ProductList() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get initial category from URL (e.g., ?category=Electronics)
  const categoryFromUrl = searchParams.get("category");
  const categoryFromState = location.state?.category;
  const initialCategoryName = categoryFromUrl || categoryFromState || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryName, setActiveCategoryName] = useState(initialCategoryName || "All Products");
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  // Fetch initial products and find the ID for the URL category
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/api/getcategories"),
          api.get("/api/client/productsbycategory")
        ]);

        // 1. Find the ID of the category from URL to pass to LeftFilter
        if (initialCategoryName) {
          const matchedCat = catRes.data.find(c => c.categoryname === initialCategoryName);
          if (matchedCat) setCurrentCategoryId(matchedCat._id);
        }

        // 2. Load Products
        if (prodRes.data.success) {
          if (initialCategoryName) {
            const categoryData = prodRes.data.categories.find((cat) => cat.category === initialCategoryName);
            setProducts(categoryData?.products?.filter((p) => p.approved) || []);
            setActiveCategoryName(initialCategoryName);
          } else {
            const all = prodRes.data.categories.flatMap((cat) => cat.products).filter((p) => p.approved);
            setProducts(all);
            setActiveCategoryName("All Products");
          }
        }
      } catch (error) {
        console.error("Initial fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialCategoryName]);

  const applyFilters = async (appliedFilters) => {
    setLoading(true);
    try {
      // Logic: Ensure we are sending the IDs of the selected categories
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

      // Update Header Title
      if (appliedFilters.selectedCategories.length === 1) {
        const catRes = await api.get("/api/getcategories");
        const catObj = catRes.data.find(c => c._id === appliedFilters.selectedCategories[0]);
        if (catObj) setActiveCategoryName(catObj.categoryname);
      } else if (appliedFilters.selectedCategories.length > 1) {
        setActiveCategoryName("Multiple Categories");
      }
    } catch (error) {
      console.log("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfcf9]  min-h-screen font-sans antialiased">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-6">
        <header className="mb-2">
          <nav className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            <Link to="/" className="hover:text-purple-600">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Collections</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-2">
            <div>
              <h1 className="text-4xl sm:text-3xl font-black text-slate-900 tracking-tight capitalize mb-2">
                {activeCategoryName}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                Showing <span className="text-purple-600 font-bold">{products.length}</span> results
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-10 mt-8">
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white border border-slate-100 shadow-sm rounded-xl">
              <LeftFilter
                onApplyFilters={applyFilters}
                initialCatId={currentCategoryId}
              />
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-3xl aspect-[4/5] border border-slate-100" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <Link
                    to={`/products/${product._id}`}
                    key={product._id}
                    className="group flex flex-col bg-white p-3 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-slate-50">
                      <img
                        src={product?.images?.[0]?.url || "/default-image.jpg"}
                        alt={product?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-yellow-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="mt-5 px-3 pb-2">
                      {product.state && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-semibold rounded-full mb-2">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {product.state}
                        </span>
                      )}
                      <h3 className="text-slate-800 text-base font-bold line-clamp-2 min-h-[2.5rem]">
                        {product.title}
                      </h3>
                      <p className="text-gray-900 py-2 text-lg font-black">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                <p className="text-slate-500 mt-2">Try changing your category or discount filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductList;