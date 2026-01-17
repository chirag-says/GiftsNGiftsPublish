import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { TextField } from "@mui/material";
import { MdOutlineEdit, MdClose, MdSaveAlt } from "react-icons/md";
import { LuTrash2, LuPackage, LuSearch, LuIndianRupee } from "react-icons/lu";
import Progress from "../../Components/Progress/Progress";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updateTask, setUpdateTask] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/product/getproducts");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setUpdateTask({
      [product._id]: {
        title: product.title,
        price: product.price,
        stock: product.stock,
      },
    });
  };

  const handleUpdateChange = (id, value, field) => {
    setUpdateTask((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveUpdate = async (id) => {
    const dataToSend = updateTask[id];
    try {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...dataToSend } : p))
      );
      await api.put(`/api/product/updateproduct/${id}`, dataToSend);
      await fetchProducts();
      setEditingId(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product");
      fetchProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/product/deleteproduct/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
          Out of Stock
        </span>
      );
    } else if (stock < 5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          Low: {stock} Left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        {stock} In Stock
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex bg-white py-6 px-6 rounded-2xl shadow-md flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor stock levels and manage pricing in real-time.
          </p>
        </div>
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:w-72 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Progress />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <LuPackage className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isEditing = editingId === product._id;
                  const draft = updateTask[product._id] || {};
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <LuPackage className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          {isEditing ? (
                            <TextField
                              fullWidth
                              size="small"
                              value={draft.title}
                              onChange={(e) => handleUpdateChange(product._id, e.target.value, "title")}
                              variant="outlined"
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.title}</span>
                              <span className="text-xs text-gray-400 font-mono">ID: {product._id.slice(-6)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <TextField
                            type="number"
                            size="small"
                            className="w-32"
                            value={draft.price}
                            onChange={(e) => handleUpdateChange(product._id, e.target.value, "price")}
                            InputProps={{ startAdornment: <span className="mr-1 text-gray-400">₹</span> }}
                          />
                        ) : (
                          <span className="text-lg font-bold text-gray-800">₹{product.price?.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <TextField
                            type="number"
                            size="small"
                            className="w-24"
                            value={draft.stock}
                            onChange={(e) => handleUpdateChange(product._id, e.target.value, "stock")}
                          />
                        ) : (
                          getStockBadge(product.stock)
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveUpdate(product._id)} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all">
                                <MdSaveAlt className="w-5 h-5" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all">
                                <MdClose className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditClick(product)} className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                <MdOutlineEdit className="w-5 h-5" />
                              </button>
                              <button onClick={() => deleteProduct(product._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                <LuTrash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredProducts.map((product) => {
              const isEditing = editingId === product._id;
              const draft = updateTask[product._id] || {};
              return (
                <div key={product._id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={product.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          label="Product Title"
                          value={draft.title}
                          onChange={(e) => handleUpdateChange(product._id, e.target.value, "title")}
                        />
                      ) : (
                        <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                      )}
                      <p className="text-xs text-gray-400">ID: {product._id.slice(-8)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1 uppercase font-bold">Price</p>
                      {isEditing ? (
                        <TextField
                          type="number"
                          size="small"
                          value={draft.price}
                          onChange={(e) => handleUpdateChange(product._id, e.target.value, "price")}
                        />
                      ) : (
                        <p className="font-bold text-gray-900">₹{product.price?.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1 uppercase font-bold text-right">Stock</p>
                      <div className="flex justify-end">
                        {isEditing ? (
                          <TextField
                            type="number"
                            size="small"
                            className="w-20"
                            value={draft.stock}
                            onChange={(e) => handleUpdateChange(product._id, e.target.value, "stock")}
                          />
                        ) : (
                          getStockBadge(product.stock)
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => saveUpdate(product._id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">
                          <MdSaveAlt /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(product)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold">
                          <MdOutlineEdit /> Edit
                        </button>
                        <button onClick={() => deleteProduct(product._id)} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold">
                          <LuTrash2 />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Stats */}
          <div className="bg-white/50 backdrop-blur-md rounded-xl p-4 border border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> results
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-gray-600 uppercase">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs font-bold text-gray-600 uppercase">Alerts</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;