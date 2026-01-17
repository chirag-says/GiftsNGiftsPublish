import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { exportToCSV } from "../../utils/exportUtils";
import { MdInventory, MdWarning, MdCheckCircle, MdDownload } from "react-icons/md";
import { FiPackage, FiAlertTriangle, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

function InventoryReports() {
  const [data, setData] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    inventoryValue: 0,
    lowStockProducts: [],
    topMovingProducts: [],
    slowMovingProducts: []
  });
  const [loading, setLoading] = useState(true);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/seller-panel/analytics/inventory');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get('/api/seller-panel/analytics/export?type=products');
      if (res.data.success && res.data.data && res.data.data.records) {
        const columns = [
          { header: 'Product Name', key: 'title' },
          { header: 'Category', key: 'category' },
          { header: 'Price', key: 'price' },
          { header: 'Stock', key: 'stock' },
          { header: 'Status', key: 'availability' },
          { header: 'Approved', key: 'approved' }
        ];
        exportToCSV(res.data.data.records, 'inventory_report', columns);
      } else {
        alert("No data to export");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Inventory Reports</h1>
          <p className="text-sm text-gray-500">Monitor your stock levels and product performance</p>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
        >
          <MdDownload className="text-lg" /> Export Report
        </button>
      </div>

      {/* Stock Overview - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-5 text-white shadow-md shadow-blue-100">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <FiPackage className="text-lg" />
            <span className="text-sm font-medium">Total Products</span>
          </div>
          <h3 className="text-2xl font-bold">{data.totalProducts}</h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-green-600 font-medium">
            <MdCheckCircle className="text-lg" />
            <span className="text-sm">In Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.inStock}</h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-yellow-600 font-medium">
            <FiAlertTriangle className="text-lg" />
            <span className="text-sm">Low Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-yellow-600">{data.lowStock}</h3>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-red-600 font-medium">
            <MdWarning className="text-lg" />
            <span className="text-sm">Out of Stock</span>
          </div>
          <h3 className="text-2xl font-bold text-red-600">{data.outOfStock}</h3>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white shadow-md shadow-purple-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <MdInventory className="text-lg" />
            <span className="text-sm font-medium">Inventory Value</span>
          </div>
          <h3 className="text-2xl font-bold">{formatINR(data.inventoryValue)}</h3>
        </div>
      </div>

      {/* Stock Distribution - Visual Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Stock Distribution</h3>
        <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${data.totalProducts ? (data.inStock / data.totalProducts) * 100 : 0}%` }}
          ></div>
          <div
            className="bg-yellow-500 h-full transition-all duration-500"
            style={{ width: `${data.totalProducts ? (data.lowStock / data.totalProducts) * 100 : 0}%` }}
          ></div>
          <div
            className="bg-red-500 h-full transition-all duration-500"
            style={{ width: `${data.totalProducts ? (data.outOfStock / data.totalProducts) * 100 : 0}%` }}
          ></div>
        </div>
        <div className="flex flex-wrap gap-4 md:gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">In Stock ({data.inStock})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Low Stock ({data.lowStock})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">Out of Stock ({data.outOfStock})</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {data.lowStockProducts?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-5 border-b border-yellow-200 flex items-center gap-2">
            <FiAlertTriangle className="text-yellow-600 text-xl shrink-0" />
            <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
          </div>
          <div className="divide-y divide-yellow-100">
            {data.lowStockProducts?.slice(0, 5).map((product, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center flex-1 gap-4">
                  <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-yellow-100 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FiPackage className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-tight">{product.sku}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-sm md:text-base font-bold text-yellow-600">{product.stock} left</p>
                    <p className="text-[10px] md:text-xs text-gray-500 uppercase">Threshold: {product.minStock || 10}</p>
                  </div>
                  <button className="px-4 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-semibold hover:bg-yellow-700 transition-colors shadow-sm">
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid for Moving Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Products */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <FiTrendingUp className="text-green-500 text-xl" />
            <h3 className="font-semibold text-gray-800">Fast Moving Products</h3>
          </div>
          {data.topMovingProducts?.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm italic">No product movement data recorded</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.topMovingProducts?.map((product, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate text-sm md:text-base">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.soldCount} sold this month</p>
                  </div>
                  <div className="text-green-600 font-bold text-sm whitespace-nowrap">
                    {product.growth}% ↑
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Slow Moving Products */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <FiTrendingDown className="text-red-500 text-xl" />
            <h3 className="font-semibold text-gray-800">Slow Moving Products</h3>
          </div>
          {data.slowMovingProducts?.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm italic">No stagnant inventory found</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.slowMovingProducts?.map((product, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate text-sm md:text-base">{product.name}</h4>
                    <p className="text-xs text-gray-500">Last sold: {product.lastSold || 'Never'}</p>
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    <p className="text-xs font-medium text-gray-600">{product.stock} units</p>
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">{product.daysSinceLastSale}+ days idle</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive Tips Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📦</span>
          <h4 className="font-bold text-blue-800">Inventory Optimization Tips</h4>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <li className="text-sm text-blue-700 flex gap-2">
            <span className="opacity-60">•</span> Keep popular items well-stocked to avoid missing sales
          </li>
          <li className="text-sm text-blue-700 flex gap-2">
            <span className="opacity-60">•</span> Consider promotions for slow-moving inventory
          </li>
          <li className="text-sm text-blue-700 flex gap-2">
            <span className="opacity-60">•</span> Set up low stock alerts to automate reordering
          </li>
          <li className="text-sm text-blue-700 flex gap-2">
            <span className="opacity-60">•</span> Review inventory value regularly to optimize cash flow
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InventoryReports;