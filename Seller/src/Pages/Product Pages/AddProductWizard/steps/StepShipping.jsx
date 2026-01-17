import React from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
    MdLocalShipping,
    MdPublic,
    MdFactory,
    MdVerified,
    MdFlightLand,
    MdStraighten,
    MdInfo
} from 'react-icons/md';

const countries = [
    'India', 'China', 'United States', 'Japan', 'Germany', 'United Kingdom',
    'Vietnam', 'Bangladesh', 'Italy', 'France', 'Thailand', 'South Korea',
    'Indonesia', 'Nepal', 'Sri Lanka', 'Other'
];

function StepShipping() {
    const { productData, updateProductData, errors } = useWizard();

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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white mb-4 shadow-lg shadow-cyan-500/25">
                    <MdLocalShipping size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Shipping & Compliance</h2>
                <p className="text-gray-500 mt-2 text-sm">Provide shipping details and regulatory information</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-5">
                {/* Shipping Dimensions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <MdStraighten className="text-cyan-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Product Dimensions</h3>
                            <p className="text-xs text-gray-500">Help buyers understand the size</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextField
                            label="Product Dimensions (L × W × H)"
                            fullWidth
                            size="small"
                            value={productData.productDimensions}
                            onChange={(e) => updateProductData('productDimensions', e.target.value)}
                            placeholder="e.g., 30 × 20 × 10 cm"
                            helperText="Length × Width × Height in cm"
                            sx={commonSx}
                        />
                        <TextField
                            label="Item Weight"
                            fullWidth
                            size="small"
                            value={productData.itemWeight}
                            onChange={(e) => updateProductData('itemWeight', e.target.value)}
                            placeholder="e.g., 500 g or 1.5 kg"
                            helperText="Weight with packaging"
                            sx={commonSx}
                        />
                    </div>
                </motion.div>

                {/* Origin & Manufacturer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <MdPublic className="text-emerald-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Origin & Manufacturer</h3>
                            <p className="text-xs text-gray-500">Where was this product made?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormControl fullWidth size="small">
                            <InputLabel>Country of Origin</InputLabel>
                            <Select
                                value={productData.countryOfOrigin}
                                onChange={(e) => updateProductData('countryOfOrigin', e.target.value)}
                                label="Country of Origin"
                                sx={commonSx}
                            >
                                {countries.map((country) => (
                                    <MenuItem key={country} value={country}>{country}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Manufacturer Name"
                            fullWidth
                            size="small"
                            value={productData.manufacturer}
                            onChange={(e) => updateProductData('manufacturer', e.target.value)}
                            placeholder="e.g., XYZ Handicrafts Pvt. Ltd."
                            sx={commonSx}
                        />

                        <TextField
                            label="Packer Name & Address"
                            fullWidth
                            size="small"
                            value={productData.packer}
                            onChange={(e) => updateProductData('packer', e.target.value)}
                            placeholder="Name and address of the packer"
                            className="md:col-span-2"
                            sx={commonSx}
                        />
                    </div>
                </motion.div>

                {/* Imported Product */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                            <MdFlightLand className="text-amber-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Import Details</h3>
                            <p className="text-xs text-gray-500">Required for imported products</p>
                        </div>
                    </div>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={productData.isImported}
                                onChange={(e) => updateProductData('isImported', e.target.checked)}
                                color="warning"
                                size="small"
                            />
                        }
                        label={<span className="text-sm text-gray-700">This is an imported product</span>}
                    />

                    {productData.isImported && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 grid grid-cols-1 gap-4 pt-4 border-t border-gray-100"
                        >
                            <TextField
                                label={<span>Importer Name <span className="text-red-500">*</span></span>}
                                fullWidth
                                size="small"
                                value={productData.importerName}
                                onChange={(e) => updateProductData('importerName', e.target.value)}
                                placeholder="Legal name of the importer"
                                error={!!errors.importerName}
                                helperText={errors.importerName}
                                sx={commonSx}
                            />
                            <TextField
                                label={<span>Importer Address <span className="text-red-500">*</span></span>}
                                fullWidth
                                size="small"
                                multiline
                                rows={2}
                                value={productData.importerAddress}
                                onChange={(e) => updateProductData('importerAddress', e.target.value)}
                                placeholder="Complete address of the importer"
                                error={!!errors.importerAddress}
                                helperText={errors.importerAddress}
                                sx={commonSx}
                            />
                        </motion.div>
                    )}
                </motion.div>

                {/* Compliance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MdVerified className="text-purple-600" size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">Compliance & Certifications</h3>
                            <p className="text-xs text-gray-500">Regulatory requirements for your product</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={productData.isBrandedProduct}
                                    onChange={(e) => updateProductData('isBrandedProduct', e.target.checked)}
                                    color="secondary"
                                    size="small"
                                />
                            }
                            label={<span className="text-sm text-gray-700">This is a branded product (requires authorization)</span>}
                        />

                        <div className="border-t border-gray-100 pt-4 space-y-3">
                            {/* FSSAI */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={productData.fssaiRequired}
                                            onChange={(e) => updateProductData('fssaiRequired', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-sm text-gray-700">FSSAI License (Food)</span>}
                                    className="min-w-[200px]"
                                />
                                {productData.fssaiRequired && (
                                    <TextField
                                        size="small"
                                        label="FSSAI License Number"
                                        value={productData.fssaiLicenseNumber}
                                        onChange={(e) => updateProductData('fssaiLicenseNumber', e.target.value)}
                                        error={!!errors.fssaiLicenseNumber}
                                        helperText={errors.fssaiLicenseNumber}
                                        sx={{ flex: 1, ...commonSx }}
                                    />
                                )}
                            </div>

                            {/* BIS */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={productData.bisRequired}
                                            onChange={(e) => updateProductData('bisRequired', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-sm text-gray-700">BIS Certification</span>}
                                    className="min-w-[200px]"
                                />
                                {productData.bisRequired && (
                                    <TextField
                                        size="small"
                                        label="BIS Certificate Number"
                                        value={productData.bisCertificateNumber}
                                        onChange={(e) => updateProductData('bisCertificateNumber', e.target.value)}
                                        error={!!errors.bisCertificateNumber}
                                        helperText={errors.bisCertificateNumber}
                                        sx={{ flex: 1, ...commonSx }}
                                    />
                                )}
                            </div>

                            {/* Drug License */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={productData.drugLicenseRequired}
                                            onChange={(e) => updateProductData('drugLicenseRequired', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-sm text-gray-700">Drug License (Health)</span>}
                                    className="min-w-[200px]"
                                />
                                {productData.drugLicenseRequired && (
                                    <TextField
                                        size="small"
                                        label="Drug License Number"
                                        value={productData.drugLicenseNumber}
                                        onChange={(e) => updateProductData('drugLicenseNumber', e.target.value)}
                                        error={!!errors.drugLicenseNumber}
                                        helperText={errors.drugLicenseNumber}
                                        sx={{ flex: 1, ...commonSx }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3"
                >
                    <MdInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="font-semibold text-blue-800 text-sm mb-1">Why is this important?</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Accurate shipping costs calculation</li>
                            <li>• Government regulatory compliance</li>
                            <li>• Building customer trust</li>
                            <li>• Avoiding legal issues</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default StepShipping;
