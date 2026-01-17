import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { MdAttachMoney, MdInventory, MdReceipt, MdInfo, MdTrendingDown } from 'react-icons/md';
import { FaRupeeSign } from 'react-icons/fa';

const GST_RATES = [0, 5, 12, 18, 28];

function StepPricing() {
    const { productData, updateProductData, errors } = useWizard();

    // Calculate discount when prices change
    const handleMrpChange = (e) => {
        const mrpValue = e.target.value;
        const roundedMrp = mrpValue ? Math.round(parseFloat(mrpValue)) : '';

        updateProductData('oldprice', roundedMrp);

        if (productData.sellingPrice && roundedMrp) {
            const discount = Math.round(((roundedMrp - productData.sellingPrice) / roundedMrp) * 100);
            updateProductData('discount', Math.max(0, Math.min(100, discount)));
        }
    };

    const handleSellingPriceChange = (e) => {
        const sellingValue = e.target.value;
        const mrp = parseFloat(productData.oldprice);

        if (!mrp || mrp <= 0) return;

        const roundedSelling = sellingValue ? Math.round(parseFloat(sellingValue)) : '';
        if (roundedSelling && roundedSelling > mrp) return;

        updateProductData('sellingPrice', roundedSelling);

        if (roundedSelling && mrp > 0) {
            const discount = Math.round(((mrp - roundedSelling) / mrp) * 100);
            updateProductData('discount', Math.max(0, Math.min(100, discount)));
        }
    };

    const handleDiscountChange = (e) => {
        const discountValue = e.target.value;
        const mrp = parseFloat(productData.oldprice);

        let roundedDiscount = discountValue ? Math.round(parseFloat(discountValue)) : '';
        roundedDiscount = Math.max(0, Math.min(100, roundedDiscount || 0));

        updateProductData('discount', roundedDiscount);

        if (mrp && mrp > 0 && roundedDiscount !== '') {
            const sellingPrice = Math.round(mrp - (mrp * roundedDiscount / 100));
            updateProductData('sellingPrice', Math.max(0, sellingPrice));
        }
    };

    const savings = useMemo(() => {
        const mrp = parseFloat(productData.oldprice) || 0;
        const selling = parseFloat(productData.sellingPrice) || 0;
        return Math.max(0, mrp - selling);
    }, [productData.oldprice, productData.sellingPrice]);

    const commonSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#f9fafb',
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/25">
                    <FaRupeeSign size={24} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Pricing & Inventory</h2>
                <p className="text-gray-500 mt-2 text-sm">Set competitive pricing and manage your inventory</p>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Pricing Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-5"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <FaRupeeSign className="text-emerald-600" size={16} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Product Pricing</h3>
                            <p className="text-xs text-gray-500">Set MRP and your selling price</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextField
                            label={<span>MRP (Maximum Retail Price) <span className="text-red-500">*</span></span>}
                            type="number"
                            fullWidth
                            size="small"
                            value={productData.oldprice}
                            onChange={handleMrpChange}
                            error={!!errors.oldprice}
                            helperText={errors.oldprice || "Enter the maximum retail price"}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            sx={commonSx}
                        />

                        <TextField
                            label="Discount %"
                            type="number"
                            fullWidth
                            size="small"
                            value={productData.discount}
                            onChange={handleDiscountChange}
                            disabled={!productData.oldprice}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            helperText="Enter discount to calculate selling price"
                            sx={commonSx}
                        />
                    </div>

                    {/* Selling Price */}
                    <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-emerald-700">Selling Price</span>
                                <span className="text-red-500 text-xs">*</span>
                            </div>
                            {productData.discount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-md"
                                >
                                    {productData.discount}% OFF
                                </motion.span>
                            )}
                        </div>
                        <TextField
                            type="number"
                            fullWidth
                            size="small"
                            value={productData.sellingPrice}
                            onChange={handleSellingPriceChange}
                            error={!!errors.sellingPrice}
                            helperText={errors.sellingPrice || (productData.oldprice ? 'Enter your selling price' : 'Enter MRP first')}
                            disabled={!productData.oldprice}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <span className="text-lg font-bold text-emerald-600">₹</span>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: 'white',
                                },
                                '& .MuiOutlinedInput-input': {
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: '#047857',
                                }
                            }}
                        />

                        {savings > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 grid grid-cols-2 gap-3"
                            >
                                <div className="p-3 bg-white rounded-lg border border-amber-200">
                                    <p className="text-xs text-amber-600 font-medium">Customer Saves</p>
                                    <p className="text-lg font-bold text-amber-700">₹{savings}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-600 font-medium">You Earn</p>
                                    <p className="text-lg font-bold text-blue-700">₹{productData.sellingPrice || 0}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Stock Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-5"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <MdInventory className="text-blue-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Inventory Management</h3>
                            <p className="text-xs text-gray-500">Set stock quantity and MOQ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextField
                            label={<span>Stock Quantity <span className="text-red-500">*</span></span>}
                            type="number"
                            fullWidth
                            size="small"
                            value={productData.stock}
                            onChange={(e) => updateProductData('stock', e.target.value)}
                            error={!!errors.stock}
                            helperText={errors.stock || "Total available units"}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">units</InputAdornment>,
                            }}
                            sx={commonSx}
                        />

                        <TextField
                            label="Minimum Order Quantity"
                            type="number"
                            fullWidth
                            size="small"
                            value={productData.moq}
                            onChange={(e) => updateProductData('moq', Math.max(1, parseInt(e.target.value) || 1))}
                            helperText="Min. units per order (default: 1)"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">units</InputAdornment>,
                            }}
                            sx={commonSx}
                        />
                    </div>

                    {productData.stock && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${productData.stock > 10 ? 'bg-emerald-500' :
                                    productData.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                }`}></span>
                            <span className="text-xs text-gray-600">
                                Status: <span className={`font-medium ${productData.stock > 10 ? 'text-emerald-600' :
                                        productData.stock > 5 ? 'text-amber-600' : 'text-red-600'
                                    }`}>
                                    {productData.stock > 10 ? 'In Stock' : productData.stock > 5 ? 'Low Stock' : 'Very Low Stock'}
                                </span>
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Tax Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MdReceipt className="text-purple-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Tax Information</h3>
                            <p className="text-xs text-gray-500">GST and HSN code for compliance</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextField
                            label="HSN Code"
                            fullWidth
                            size="small"
                            value={productData.hsnCode}
                            onChange={(e) => updateProductData('hsnCode', e.target.value)}
                            placeholder="e.g., 6201"
                            helperText="Harmonized System Nomenclature code"
                            sx={commonSx}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>GST Rate</InputLabel>
                            <Select
                                value={productData.gstRate}
                                onChange={(e) => updateProductData('gstRate', e.target.value)}
                                label="GST Rate"
                                sx={commonSx}
                            >
                                {GST_RATES.map((rate) => (
                                    <MenuItem key={rate} value={rate}>
                                        {rate}% GST
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {productData.sellingPrice && productData.gstRate > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
                        >
                            <MdInfo className="text-gray-400" size={16} />
                            <span className="text-xs text-gray-600">
                                GST Amount: <strong className="text-gray-800">₹{Math.round((productData.sellingPrice * productData.gstRate) / (100 + productData.gstRate))}</strong>
                                {' '} (included in selling price)
                            </span>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Pricing Summary */}
            {productData.sellingPrice && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mt-6 p-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white shadow-lg"
                >
                    <h4 className="text-sm font-medium mb-4 opacity-90">Pricing Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs opacity-75">MRP</p>
                            <p className="text-lg font-bold">₹{productData.oldprice}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-75">Discount</p>
                            <p className="text-lg font-bold">{productData.discount || 0}%</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-75">Selling Price</p>
                            <p className="text-xl font-bold">₹{productData.sellingPrice}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-75">Stock</p>
                            <p className="text-lg font-bold">{productData.stock || 0} units</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default StepPricing;
