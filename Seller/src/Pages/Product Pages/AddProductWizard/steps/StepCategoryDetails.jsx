import React from 'react';
import { motion } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import { MdTune, MdInfo, MdCheckCircle } from 'react-icons/md';
import { FIELD_TYPES } from '../../../../config/categoryAttributes';

// Dynamic Field Component
const DynamicField = ({ field, value, onChange, error }) => {
    const handleChange = (e) => {
        onChange(field.name, e.target.value);
    };

    const commonSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#f9fafb',
        }
    };

    switch (field.type) {
        case FIELD_TYPES.SELECT:
            return (
                <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel>{field.label} {field.required && <span className="text-red-500">*</span>}</InputLabel>
                    <Select
                        value={value || field.default || ''}
                        onChange={handleChange}
                        label={field.label}
                        sx={commonSx}
                    >
                        <MenuItem value="" disabled>Select {field.label}</MenuItem>
                        {field.options?.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                    {error && <p className="text-red-500 text-xs mt-1 ml-3">{error}</p>}
                </FormControl>
            );

        case FIELD_TYPES.TEXTAREA:
            return (
                <TextField
                    label={<span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>}
                    value={value || ''}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    placeholder={field.placeholder}
                    error={!!error}
                    helperText={error}
                    sx={commonSx}
                />
            );

        case FIELD_TYPES.NUMBER:
            return (
                <TextField
                    label={<span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>}
                    type="number"
                    value={value || ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder={field.placeholder}
                    error={!!error}
                    helperText={error}
                    sx={commonSx}
                />
            );

        case FIELD_TYPES.DATE:
            return (
                <TextField
                    label={<span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>}
                    type="date"
                    value={value || ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!error}
                    helperText={error}
                    sx={commonSx}
                />
            );

        default:
            return (
                <TextField
                    label={<span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>}
                    value={value || ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder={field.placeholder}
                    error={!!error}
                    helperText={error}
                    sx={commonSx}
                />
            );
    }
};

function StepCategoryDetails() {
    const { productData, categoryConfig, updateDynamicAttribute, errors } = useWizard();

    // Group fields by required/optional
    const requiredFields = categoryConfig?.fields?.filter(f => f.required) || [];
    const optionalFields = categoryConfig?.fields?.filter(f => !f.required) || [];

    if (!categoryConfig || !categoryConfig.fields?.length) {
        return (
            <div className="space-y-6">
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-6">
                        <MdTune className="text-gray-400" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Additional Details Required</h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        This category doesn't require any specific details. You can proceed to the next step.
                    </p>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mt-6 text-gray-400 text-sm"
                    >
                        Click Continue to proceed
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-4 shadow-lg shadow-indigo-500/25">
                    <MdTune size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{categoryConfig.label} Details</h2>
                <p className="text-gray-500 mt-2 text-sm">Provide category-specific information for better listing</p>
            </div>

            {/* Category Badge */}
            <div className="flex items-center justify-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-100">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {requiredFields.length} required
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {optionalFields.length} optional
                </span>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Required Fields */}
                {requiredFields.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <h3 className="font-semibold text-gray-700 text-sm">Required Information</h3>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {requiredFields.map((field, index) => (
                                    <motion.div
                                        key={field.name}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={field.type === FIELD_TYPES.TEXTAREA ? 'md:col-span-2' : ''}
                                    >
                                        <DynamicField
                                            field={field}
                                            value={productData.dynamicAttributes[field.name]}
                                            onChange={updateDynamicAttribute}
                                            error={errors[field.name]}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Optional Fields */}
                {optionalFields.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <h3 className="font-semibold text-gray-700 text-sm">Optional Information</h3>
                            <span className="text-xs text-gray-400">(Helps improve discoverability)</span>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {optionalFields.map((field, index) => (
                                    <motion.div
                                        key={field.name}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.02 }}
                                        className={field.type === FIELD_TYPES.TEXTAREA ? 'md:col-span-2' : ''}
                                    >
                                        <DynamicField
                                            field={field}
                                            value={productData.dynamicAttributes[field.name]}
                                            onChange={updateDynamicAttribute}
                                            error={errors[field.name]}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Filled Fields Summary */}
            {Object.keys(productData.dynamicAttributes).filter(k => productData.dynamicAttributes[k]).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <MdCheckCircle className="text-emerald-500" size={18} />
                        <p className="text-sm text-emerald-700 font-medium">Filled Attributes</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(productData.dynamicAttributes).map(([key, value]) => {
                            if (!value) return null;
                            const field = categoryConfig.fields?.find(f => f.name === key);
                            return (
                                <Chip
                                    key={key}
                                    label={`${field?.label || key}: ${value}`}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#d1fae5',
                                        color: '#065f46',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default StepCategoryDetails;
