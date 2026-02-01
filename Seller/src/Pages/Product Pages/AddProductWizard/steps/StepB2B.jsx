import React from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, InputAdornment, Chip } from '@mui/material';
import {
    MdBusinessCenter,
    MdPeople,
    MdLocalOffer,
    MdCardGiftcard,
    MdPrint,
    MdMessage,
    MdInventory2,
    MdAdd,
    MdClose,
    MdInfo
} from 'react-icons/md';
import { FaRupeeSign } from 'react-icons/fa';

// Recipient types for B2B gifting
const RECIPIENT_TYPES = [
    'Employees',
    'Clients',
    'VIP Clients',
    'Partners',
    'Vendors',
    'Team',
    'Family',
    'Friends',
    'Everyone'
];

// Perfect for tags
const PERFECT_FOR_SUGGESTIONS = [
    'VIP Clients',
    'Large Teams',
    'Festive Gifting',
    'Employee Recognition',
    'Client Appreciation',
    'Welcome Kits',
    'Milestone Celebrations',
    'Retirement Gifts',
    'Diwali Hampers',
    'Corporate Events'
];

// Product types
const PRODUCT_TYPES = [
    'Single Item',
    'Gift Set',
    'Hamper',
    'Combo',
    'Subscription Box'
];

function StepB2B() {
    const { productData, updateProductData, errors } = useWizard();

    const [newContent, setNewContent] = React.useState('');
    const [newPerfectFor, setNewPerfectFor] = React.useState('');

    const handleToggleRecipient = (recipient) => {
        const current = productData.recipientTypes || [];
        if (current.includes(recipient)) {
            updateProductData('recipientTypes', current.filter(r => r !== recipient));
        } else {
            updateProductData('recipientTypes', [...current, recipient]);
        }
    };

    const handleAddContent = () => {
        if (newContent.trim()) {
            const current = productData.contents || [];
            updateProductData('contents', [...current, newContent.trim()]);
            setNewContent('');
        }
    };

    const handleRemoveContent = (index) => {
        const current = productData.contents || [];
        updateProductData('contents', current.filter((_, i) => i !== index));
    };

    const handleAddPerfectFor = (tag) => {
        const current = productData.perfectFor || [];
        if (!current.includes(tag)) {
            updateProductData('perfectFor', [...current, tag]);
        }
        setNewPerfectFor('');
    };

    const handleRemovePerfectFor = (tag) => {
        const current = productData.perfectFor || [];
        updateProductData('perfectFor', current.filter(t => t !== tag));
    };

    const handleBulkPricingChange = (tier, value) => {
        updateProductData('bulkPricing', {
            ...productData.bulkPricing,
            [tier]: value ? parseInt(value) : ''
        });
    };

    const handleCustomizationChange = (field, checked) => {
        updateProductData('customizationAvailable', {
            ...productData.customizationAvailable,
            [field]: checked
        });
    };

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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/25">
                    <MdBusinessCenter size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">B2B & Corporate Gifting</h2>
                <p className="text-gray-500 mt-2 text-sm">Configure bulk pricing and corporate customization options</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-5">
                {/* Product Type & Delivery */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <MdCardGiftcard className="text-indigo-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Product Type & Delivery</h3>
                            <p className="text-xs text-gray-500">Define product type and estimated delivery time</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormControl fullWidth size="small">
                            <InputLabel>Product Type</InputLabel>
                            <Select
                                value={productData.productType || 'Single Item'}
                                onChange={(e) => updateProductData('productType', e.target.value)}
                                label="Product Type"
                                sx={commonSx}
                            >
                                {PRODUCT_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Delivery Time"
                            fullWidth
                            size="small"
                            value={productData.deliveryDays}
                            onChange={(e) => updateProductData('deliveryDays', e.target.value)}
                            placeholder="e.g., 5-7 days"
                            helperText="Estimated delivery time for orders"
                            sx={commonSx}
                        />
                    </div>
                </motion.div>

                {/* Bulk Pricing Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MdLocalOffer className="text-emerald-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Bulk Pricing Tiers</h3>
                            <p className="text-xs text-gray-500">Set discounted prices for larger quantities (optional)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1.5 block">25-49 units</label>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                value={productData.bulkPricing?.tier25 || ''}
                                onChange={(e) => handleBulkPricingChange('tier25', e.target.value)}
                                placeholder="Price"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={commonSx}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">~5% off suggested</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1.5 block">50-99 units</label>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                value={productData.bulkPricing?.tier50 || ''}
                                onChange={(e) => handleBulkPricingChange('tier50', e.target.value)}
                                placeholder="Price"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={commonSx}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">~10% off suggested</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1.5 block">100-499 units</label>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                value={productData.bulkPricing?.tier100 || ''}
                                onChange={(e) => handleBulkPricingChange('tier100', e.target.value)}
                                placeholder="Price"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={commonSx}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">~15% off suggested</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 font-medium mb-1.5 block">500+ units</label>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                value={productData.bulkPricing?.tier500 || ''}
                                onChange={(e) => handleBulkPricingChange('tier500', e.target.value)}
                                placeholder="Price"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                }}
                                sx={commonSx}
                            />
                            <p className="text-[10px] text-gray-400 mt-1">~20% off suggested</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <MdInfo className="flex-shrink-0 mt-0.5 text-gray-400" size={14} />
                        <p>Leave empty if you don't offer bulk discounts. These prices will be shown to corporate buyers on the B2B portal.</p>
                    </div>
                </motion.div>

                {/* Customization Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MdPrint className="text-purple-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Customization Options</h3>
                            <p className="text-xs text-gray-500">What customization can you offer for corporate orders?</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MdPrint className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">Logo Printing</p>
                                    <p className="text-xs text-gray-500">Add company logo to products</p>
                                </div>
                            </div>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={productData.customizationAvailable?.logo || false}
                                        onChange={(e) => handleCustomizationChange('logo', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label=""
                            />
                        </div>

                        {productData.customizationAvailable?.logo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="ml-10"
                            >
                                <TextField
                                    label="Minimum Quantity for Logo"
                                    type="number"
                                    size="small"
                                    value={productData.logoMinQuantity}
                                    onChange={(e) => updateProductData('logoMinQuantity', parseInt(e.target.value) || 25)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">units</InputAdornment>,
                                    }}
                                    helperText="Min. units required for logo printing"
                                    sx={commonSx}
                                />
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <MdMessage className="text-pink-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">Custom Message Card</p>
                                    <p className="text-xs text-gray-500">Include personalized greeting cards</p>
                                </div>
                            </div>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={productData.customizationAvailable?.message ?? true}
                                        onChange={(e) => handleCustomizationChange('message', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label=""
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <MdCardGiftcard className="text-amber-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">Premium Packaging</p>
                                    <p className="text-xs text-gray-500">Gift-ready presentation with premium packaging</p>
                                </div>
                            </div>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={productData.customizationAvailable?.packaging ?? true}
                                        onChange={(e) => handleCustomizationChange('packaging', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label=""
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Target Recipients */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                            <MdPeople className="text-teal-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Target Recipients</h3>
                            <p className="text-xs text-gray-500">Who is this product ideal for? (Select all that apply)</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {RECIPIENT_TYPES.map((recipient) => {
                            const isSelected = productData.recipientTypes?.includes(recipient);
                            return (
                                <button
                                    key={recipient}
                                    type="button"
                                    onClick={() => handleToggleRecipient(recipient)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${isSelected
                                        ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                                        }`}
                                >
                                    {recipient}
                                </button>
                            );
                        })}
                    </div>

                    {productData.recipientTypes?.length > 0 && (
                        <p className="mt-3 text-xs text-teal-600">
                            {productData.recipientTypes.length} recipient type(s) selected
                        </p>
                    )}
                </motion.div>

                {/* Perfect For Tags */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                            <MdLocalOffer className="text-orange-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Perfect For Tags</h3>
                            <p className="text-xs text-gray-500">Add tags that describe ideal use cases (shown on product cards)</p>
                        </div>
                    </div>

                    {/* Current tags */}
                    {productData.perfectFor?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {productData.perfectFor.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleRemovePerfectFor(tag)}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-2">
                            {PERFECT_FOR_SUGGESTIONS.filter(s => !productData.perfectFor?.includes(s)).slice(0, 6).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => handleAddPerfectFor(suggestion)}
                                    className="px-2.5 py-1 rounded-lg text-xs text-gray-600 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 transition-colors border border-gray-200"
                                >
                                    + {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom tag input */}
                    <div className="flex gap-2">
                        <TextField
                            size="small"
                            value={newPerfectFor}
                            onChange={(e) => setNewPerfectFor(e.target.value)}
                            placeholder="Add custom tag..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerfectFor(newPerfectFor))}
                            sx={{ ...commonSx, flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => handleAddPerfectFor(newPerfectFor)}
                            disabled={!newPerfectFor.trim()}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <MdAdd size={18} />
                        </button>
                    </div>
                </motion.div>

                {/* Contents (for Hampers/Gift Sets) */}
                {(productData.productType === 'Hamper' || productData.productType === 'Gift Set' || productData.productType === 'Combo') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center">
                                <MdInventory2 className="text-rose-600" size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-sm">Contents</h3>
                                <p className="text-xs text-gray-500">List items included in this {productData.productType?.toLowerCase()}</p>
                            </div>
                        </div>

                        {/* Current contents */}
                        {productData.contents?.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {productData.contents.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-rose-600 bg-rose-100 rounded-full">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1 text-sm text-gray-700">{item}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContent(index)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <MdClose size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add content input */}
                        <div className="flex gap-2">
                            <TextField
                                size="small"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="e.g., Assam Tea 100g, Bamboo Coasters Set of 4..."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddContent())}
                                sx={{ ...commonSx, flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleAddContent}
                                disabled={!newContent.trim()}
                                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdAdd size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="max-w-4xl mx-auto mt-6 p-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg"
            >
                <h4 className="text-sm font-medium mb-4 opacity-90">B2B Configuration Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-xs opacity-75">Product Type</p>
                        <p className="font-semibold">{productData.productType || 'Single Item'}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75">Bulk Tiers</p>
                        <p className="font-semibold">
                            {Object.values(productData.bulkPricing || {}).filter(Boolean).length} configured
                        </p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75">Customization</p>
                        <p className="font-semibold">
                            {Object.values(productData.customizationAvailable || {}).filter(Boolean).length} options
                        </p>
                    </div>
                    <div>
                        <p className="text-xs opacity-75">Target Recipients</p>
                        <p className="font-semibold">{productData.recipientTypes?.length || 0} selected</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default StepB2B;
