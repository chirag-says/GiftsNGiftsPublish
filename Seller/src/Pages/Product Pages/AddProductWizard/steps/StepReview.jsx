import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { Chip } from '@mui/material';
import {
    MdCheckCircle,
    MdCategory,
    MdDescription,
    MdAttachMoney,
    MdPhotoLibrary,
    MdLocalShipping,
    MdEdit,
    MdInfo,
    MdInventory,
    MdLocationCity,
    MdCelebration
} from 'react-icons/md';

function StepReview() {
    const { productData, categoryConfig, categories, subcategories } = useWizard();

    const categoryInfo = useMemo(() => {
        const category = categories.find(c => c._id === productData.categoryId);
        const subcategory = subcategories.find(s => s._id === productData.subcategoryId);
        return { category, subcategory };
    }, [productData.categoryId, productData.subcategoryId, categories, subcategories]);

    const imagePreviews = useMemo(() =>
        productData.images.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        })),
        [productData.images]);

    React.useEffect(() => {
        return () => imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    }, [imagePreviews]);

    const savings = useMemo(() => {
        const mrp = parseFloat(productData.oldprice) || 0;
        const selling = parseFloat(productData.sellingPrice) || 0;
        return Math.max(0, mrp - selling);
    }, [productData.oldprice, productData.sellingPrice]);

    const Section = ({ title, icon: Icon, children }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Icon className="text-blue-600" size={16} />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                </div>
            </div>
            <div className="p-5">{children}</div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4 shadow-lg shadow-emerald-500/25">
                    <MdCheckCircle size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Review Your Listing</h2>
                <p className="text-gray-500 mt-2 text-sm">Double-check everything before publishing</p>
            </div>

            {/* Product Preview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-gray-50 rounded-xl p-5 border border-gray-200"
            >
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-4">Live Preview</p>
                <div className="flex flex-col md:flex-row gap-5">
                    <div className="w-full md:w-1/3">
                        {imagePreviews[0] ? (
                            <img
                                src={imagePreviews[0].url}
                                alt="Product"
                                className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                                <MdPhotoLibrary className="text-gray-400" size={40} />
                            </div>
                        )}
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                            {imagePreviews.slice(1, 4).map((img, i) => (
                                <img
                                    key={i}
                                    src={img.url}
                                    alt={`Preview ${i + 2}`}
                                    className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                {productData.categoryName}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                {productData.subcategoryName}
                            </span>
                            {productData.state && (
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded font-medium">
                                    📍 {productData.state}
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-1">{productData.title || 'Product Title'}</h3>

                        {productData.brand && (
                            <p className="text-xs text-gray-500 mb-3">by {productData.brand}</p>
                        )}

                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-2xl font-bold text-emerald-600">₹{productData.sellingPrice}</span>
                            {productData.oldprice && productData.oldprice !== productData.sellingPrice && (
                                <>
                                    <span className="text-sm text-gray-400 line-through">₹{productData.oldprice}</span>
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                                        {productData.discount}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <span className={`w-2 h-2 rounded-full ${productData.stock > 10 ? 'bg-emerald-500' :
                                productData.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                }`}></span>
                            <span className="text-xs text-gray-600">
                                {productData.stock > 10 ? 'In Stock' : productData.stock > 5 ? 'Low Stock' : 'Limited'}
                                {' '}({productData.stock} units)
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                            {productData.description || 'Product description...'}
                        </p>

                        {productData.occasions?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                                {productData.occasions.slice(0, 4).map(occ => (
                                    <span key={occ} className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded">
                                        {occ}
                                    </span>
                                ))}
                                {productData.occasions.length > 4 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{productData.occasions.length - 4} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Category Info */}
                <Section title="Category" icon={MdCategory}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="font-medium text-gray-800 text-sm">{productData.categoryName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Subcategory</p>
                            <p className="font-medium text-gray-800 text-sm">{productData.subcategoryName}</p>
                        </div>
                    </div>
                </Section>

                {/* State & Occasions */}
                {(productData.state || productData.occasions?.length > 0) && (
                    <Section title="Region & Occasions" icon={MdLocationCity}>
                        <div className="space-y-3">
                            {productData.state && (
                                <div>
                                    <p className="text-xs text-gray-500">Origin State</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MdLocationCity className="text-teal-600" size={16} />
                                        <span className="font-medium text-gray-800 text-sm">{productData.state}</span>
                                    </div>
                                </div>
                            )}
                            {productData.occasions?.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500">Suitable Occasions</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {productData.occasions.map(occ => (
                                            <Chip
                                                key={occ}
                                                label={occ}
                                                size="small"
                                                sx={{ fontSize: '0.65rem', height: '22px', bgcolor: '#fce7f3', color: '#db2777' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* Pricing */}
                <Section title="Pricing" icon={MdAttachMoney}>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">MRP</p>
                            <p className="font-bold text-gray-800">₹{productData.oldprice}</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <p className="text-xs text-emerald-600">Selling</p>
                            <p className="font-bold text-emerald-700">₹{productData.sellingPrice}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600">Discount</p>
                            <p className="font-bold text-red-700">{productData.discount || 0}%</p>
                        </div>
                    </div>
                </Section>

                {/* Basic Info */}
                <Section title="Product Info" icon={MdDescription}>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Title</p>
                            <p className="font-medium text-gray-800 text-sm">{productData.title}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Description</p>
                            <p className="text-gray-700 text-sm line-clamp-2">{productData.description}</p>
                        </div>
                    </div>
                </Section>

                {/* Stock */}
                <Section title="Inventory" icon={MdInventory}>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-xs text-gray-500">Stock</p>
                            <p className="font-medium text-gray-800">{productData.stock} units</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">MOQ</p>
                            <p className="font-medium text-gray-800">{productData.moq || 1}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">GST</p>
                            <p className="font-medium text-gray-800">{productData.gstRate}%</p>
                        </div>
                    </div>
                </Section>

                {/* Images */}
                <Section title="Images" icon={MdPhotoLibrary}>
                    <div className="flex gap-2 overflow-x-auto">
                        {imagePreviews.map((img, i) => (
                            <div key={i} className="relative flex-shrink-0">
                                <img
                                    src={img.url}
                                    alt={`Image ${i + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                {i === 0 && (
                                    <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded">
                                        MAIN
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{productData.images.length} image(s)</p>
                </Section>

                {/* Shipping */}
                <Section title="Shipping" icon={MdLocalShipping}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-gray-500">Origin</p>
                            <p className="font-medium text-gray-800 text-sm">{productData.countryOfOrigin}</p>
                        </div>
                        {productData.itemWeight && (
                            <div>
                                <p className="text-xs text-gray-500">Weight</p>
                                <p className="font-medium text-gray-800 text-sm">{productData.itemWeight}</p>
                            </div>
                        )}
                    </div>
                    {(productData.isImported || productData.isBrandedProduct || productData.fssaiRequired) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {productData.isImported && <Chip label="Imported" size="small" color="warning" sx={{ fontSize: '0.65rem', height: '22px' }} />}
                            {productData.isBrandedProduct && <Chip label="Branded" size="small" color="secondary" sx={{ fontSize: '0.65rem', height: '22px' }} />}
                            {productData.fssaiRequired && <Chip label="FSSAI" size="small" color="success" sx={{ fontSize: '0.65rem', height: '22px' }} />}
                        </div>
                    )}
                </Section>

                {/* Category Details */}
                {categoryConfig && Object.keys(productData.dynamicAttributes).filter(k => productData.dynamicAttributes[k]).length > 0 && (
                    <Section title={`${categoryConfig.label} Details`} icon={MdInfo}>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(productData.dynamicAttributes).slice(0, 6).map(([key, value]) => {
                                if (!value) return null;
                                const field = categoryConfig.fields?.find(f => f.name === key);
                                return (
                                    <div key={key}>
                                        <p className="text-xs text-gray-500">{field?.label || key}</p>
                                        <p className="font-medium text-gray-800 text-sm truncate">{value}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}
            </div>

            {/* Ready Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-emerald-50 rounded-xl p-5 border border-emerald-200"
            >
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <MdCheckCircle className="text-white" size={22} />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-emerald-800 mb-1">Ready to Publish</h4>
                        <p className="text-sm text-emerald-700">
                            Your product listing is complete. Click "Publish Product" to submit for review
                            (typically within 24-48 hours).
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default StepReview;
