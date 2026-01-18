import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Button, FormControl, TextField, Autocomplete, Tooltip, InputLabel, Chip } from '@mui/material';
import { MdOutlineCloudUpload, MdDescription, MdAttachMoney, MdInfo, MdCategory, MdHelp, MdCheckCircle } from 'react-icons/md';
import { FiPackage } from 'react-icons/fi';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCategory from '../Category/AddCategory';
import AddSubCategory from '../Category/AddSubCategory';
import { getAttributesForCategory, COMMON_FIELDS, FIELD_TYPES } from '../../config/categoryAttributes';

const MAX_IMAGES = 5;

const Req = () => <span className="text-red-500 font-bold ml-1">*</span>;

const FormCard = ({ children, color, title, icon, collapsed = false, toggleable = false }) => {
  const [isOpen, setIsOpen] = useState(!collapsed);

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-t-4 ${color} overflow-hidden mb-6 transition-all hover:shadow-xl`}>
      <div
        className={`px-6 py-4 bg-opacity-10 flex items-center justify-between border-b border-gray-100 ${toggleable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => toggleable && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-50 text-xl">{icon}</div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {toggleable && (
          <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        )}
      </div>
      <div className={`transition-all duration-300 ${isOpen ? 'p-6' : 'h-0 overflow-hidden p-0'}`}>
        {children}
      </div>
    </div>
  );
};

const FieldHint = ({ text }) => (
  <Tooltip title={text} arrow placement="top">
    <span className="ml-1 text-gray-400 cursor-help inline-flex"><MdHelp size={16} /></span>
  </Tooltip>
);

// Dynamic Field Renderer Component
const DynamicField = ({ field, value, onChange }) => {
  const handleChange = (e) => {
    onChange(field.name, e.target.value);
  };

  switch (field.type) {
    case FIELD_TYPES.SELECT:
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{field.label} {field.required && <Req />}</InputLabel>
          <Select
            value={value || ''}
            onChange={handleChange}
            label={field.label}
          >
            <MenuItem value="" disabled>Select {field.label}</MenuItem>
            {field.options?.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case FIELD_TYPES.TEXTAREA:
      return (
        <TextField
          label={<span>{field.label} {field.required && <Req />}</span>}
          value={value || ''}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder={field.placeholder}
        />
      );

    case FIELD_TYPES.NUMBER:
      return (
        <TextField
          label={<span>{field.label} {field.required && <Req />}</span>}
          type="number"
          value={value || ''}
          onChange={handleChange}
          fullWidth
          size="small"
          placeholder={field.placeholder}
        />
      );

    case FIELD_TYPES.DATE:
      return (
        <TextField
          label={<span>{field.label} {field.required && <Req />}</span>}
          type="date"
          value={value || ''}
          onChange={handleChange}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
      );

    default:
      return (
        <TextField
          label={<span>{field.label} {field.required && <Req />}</span>}
          value={value || ''}
          onChange={handleChange}
          fullWidth
          size="small"
          placeholder={field.placeholder}
        />
      );
  }
};

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [openAddCategoryModal, setOpenAddCategoryModal] = useState(false);
  const [openAddSubCategoryModal, setOpenAddSubCategoryModal] = useState(false);
  const [approved, setApproved] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(true);

  // Core product fields
  const [coreProduct, setCoreProduct] = useState({
    title: '',
    description: '',
    categoryname: '',
    subcategory: '',
    oldprice: '',      // MRP
    sellingPrice: '',  // Directly editable selling price
    discount: '',      // Auto-calculated discount %
    stock: '',
    highlights: '',
  });

  // Dynamic attributes based on category
  const [dynamicAttributes, setDynamicAttributes] = useState({});
  const [currentCategoryConfig, setCurrentCategoryConfig] = useState(null);

  const [formError, setFormError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchSeller();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/api/getcategories`);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setFormError('Unable to load categories. Please refresh.');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await api.get(`/api/getsubcategories`);
      setSubcategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setFormError('Unable to load subcategories. Please refresh.');
    }
  };

  const fetchSeller = async () => {
    try {
      const res = await api.get(`/api/seller/sellerdetails`);
      if (res.data.success && Array.isArray(res.data.seller) && res.data.seller.length) {
        setApproved(res.data.seller[0].approved);
      }
    } catch (error) {
      setFormError('Unable to verify seller status.');
    } finally {
      setSellerLoading(false);
    }
  };

  // Update dynamic fields when category changes
  useEffect(() => {
    if (coreProduct.categoryname) {
      const selectedCategory = categories.find(c => c._id === coreProduct.categoryname);
      if (selectedCategory) {
        const config = getAttributesForCategory(selectedCategory.categoryname);
        setCurrentCategoryConfig(config);
        // Reset dynamic attributes when category changes
        setDynamicAttributes({});
      }
    } else {
      setCurrentCategoryConfig(null);
      setDynamicAttributes({});
    }
  }, [coreProduct.categoryname, categories]);

  // Filter subcategories
  useEffect(() => {
    if (coreProduct.categoryname) {
      const filtered = subcategories.filter(sub => sub.category?._id === coreProduct.categoryname);
      setFilteredSubcategories(filtered);
      if (!filtered.some(sub => sub._id === coreProduct.subcategory)) {
        setCoreProduct(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setFilteredSubcategories([]);
    }
  }, [coreProduct.categoryname, subcategories]);

  const handleCoreChange = (e) => {
    const { name, value } = e.target;
    setFormError('');
    setSubmitMessage('');
    setCoreProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleDynamicChange = (fieldName, value) => {
    setFormError('');
    setDynamicAttributes(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleImageUpload = (files) => {
    if (!files?.length) return;
    setFormError('');
    const availableSlots = MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setFormError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const validFiles = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
    ).slice(0, availableSlots);
    setImages(prev => [...prev, ...validFiles]);
  };

  const handleImageRemove = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle MRP change - Auto-calculate selling price if discount exists
  const handleMrpChange = (e) => {
    const mrpValue = e.target.value;
    setFormError('');

    // Round MRP to integer
    const roundedMrp = mrpValue ? Math.round(parseFloat(mrpValue)) : '';

    setCoreProduct(prev => {
      const newState = { ...prev, oldprice: roundedMrp };

      // If discount exists, calculate selling price
      if (prev.discount && roundedMrp) {
        const discount = parseFloat(prev.discount);
        const sellingPrice = Math.round(roundedMrp - (roundedMrp * discount / 100));
        newState.sellingPrice = sellingPrice > 0 ? sellingPrice : '';
      }

      return newState;
    });
  };

  // Handle Selling Price change - Auto-calculate discount from MRP and Selling Price
  const handleSellingPriceChange = (e) => {
    const sellingValue = e.target.value;
    setFormError('');

    const mrp = parseFloat(coreProduct.oldprice);

    if (!mrp || mrp <= 0) {
      setFormError('Please enter MRP first');
      return;
    }

    // Round selling price to integer
    const roundedSelling = sellingValue ? Math.round(parseFloat(sellingValue)) : '';

    if (roundedSelling && roundedSelling > mrp) {
      setFormError('Selling price cannot exceed MRP');
      return;
    }

    // Calculate discount percentage
    let discount = '';
    if (roundedSelling && mrp > 0) {
      discount = Math.round(((mrp - roundedSelling) / mrp) * 100);
      if (discount < 0) discount = 0;
      if (discount > 100) discount = 100;
    }

    setCoreProduct(prev => ({
      ...prev,
      sellingPrice: roundedSelling,
      discount: discount
    }));
  };

  // Handle Discount change - Auto-calculate selling price from MRP and Discount
  const handleDiscountChange = (e) => {
    const discountValue = e.target.value;
    setFormError('');

    const mrp = parseFloat(coreProduct.oldprice);

    // Round discount to integer
    let roundedDiscount = discountValue ? Math.round(parseFloat(discountValue)) : '';

    // Clamp discount between 0-100
    if (roundedDiscount < 0) roundedDiscount = 0;
    if (roundedDiscount > 100) roundedDiscount = 100;

    // Calculate selling price
    let sellingPrice = '';
    if (mrp && mrp > 0 && roundedDiscount !== '') {
      sellingPrice = Math.round(mrp - (mrp * roundedDiscount / 100));
      if (sellingPrice < 0) sellingPrice = 0;
    }

    setCoreProduct(prev => ({
      ...prev,
      discount: roundedDiscount,
      sellingPrice: sellingPrice
    }));
  };

  // Final price for submission (same as selling price now)
  const finalPrice = useMemo(() => {
    return coreProduct.sellingPrice || '';
  }, [coreProduct.sellingPrice]);

  const imagePreviews = useMemo(() =>
    images.map(file => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  useEffect(() => {
    return () => imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
  }, [imagePreviews]);

  const formCompletion = useMemo(() => {
    const reqFields = ['title', 'description', 'categoryname', 'subcategory', 'oldprice', 'sellingPrice', 'stock'];
    const reqFilled = reqFields.filter(f => String(coreProduct[f] || '').trim()).length;
    const dynFields = currentCategoryConfig?.fields?.filter(f => f.required) || [];
    const dynFilled = dynFields.filter(f => String(dynamicAttributes[f.name] || '').trim()).length;
    const imgFilled = images.length > 0 ? 1 : 0;
    const total = reqFields.length + dynFields.length + 1;
    const filled = reqFilled + dynFilled + imgFilled;
    return Math.round((filled / total) * 100);
  }, [coreProduct, dynamicAttributes, images, currentCategoryConfig]);

  const addproduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitMessage('');

    // Validate required core fields
    const reqFields = ['title', 'description', 'categoryname', 'subcategory', 'oldprice', 'sellingPrice', 'stock'];
    if (reqFields.some(f => !String(coreProduct[f] || '').trim())) {
      setFormError('Please fill all required fields marked with *');
      return;
    }

    // Validate selling price doesn't exceed MRP
    if (Number(coreProduct.sellingPrice) > Number(coreProduct.oldprice)) {
      setFormError('Selling price cannot exceed MRP');
      return;
    }
    if (coreProduct.title.trim().length < 5) {
      setFormError('Product title must be at least 5 characters');
      return;
    }
    if (coreProduct.description.trim().length < 20) {
      setFormError('Description must be at least 20 characters');
      return;
    }
    if (!images.length) {
      setFormError('Upload at least one product image');
      return;
    }
    if (Number(coreProduct.stock) <= 0) {
      setFormError('Stock must be at least 1');
      return;
    }

    // Validate required dynamic fields
    const reqDynamic = currentCategoryConfig?.fields?.filter(f => f.required) || [];
    for (const field of reqDynamic) {
      if (!String(dynamicAttributes[field.name] || '').trim()) {
        setFormError(`Please fill required field: ${field.label}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add core fields
      Object.entries(coreProduct).forEach(([k, v]) => {
        if (v && String(v).trim()) formData.append(k, v);
      });
      formData.append('price', finalPrice);

      // Add dynamic attributes as JSON string in additional_details
      if (Object.keys(dynamicAttributes).length > 0) {
        formData.append('additional_details', JSON.stringify(dynamicAttributes));
      }

      // Add highlights
      if (coreProduct.highlights) {
        formData.append('aboutThisItem', coreProduct.highlights);
      }

      // Extract common fields from dynamic attributes for backend compatibility
      if (dynamicAttributes.material) formData.append('materialComposition', dynamicAttributes.material);
      if (dynamicAttributes.weight) formData.append('itemWeight', dynamicAttributes.weight);
      if (dynamicAttributes.dimensions) formData.append('productDimensions', dynamicAttributes.dimensions);
      if (dynamicAttributes.careInstructions) formData.append('careInstructions', dynamicAttributes.careInstructions);
      if (dynamicAttributes.manufacturer) formData.append('manufacturer', dynamicAttributes.manufacturer);

      // Add images
      images.forEach(img => formData.append('images', img));

      const response = await api.post('/api/seller/addproducts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSubmitMessage('🎉 Product added successfully!');
        resetForm();
      } else {
        setFormError(response.data.message || 'Failed to add product');
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCoreProduct({
      title: '', description: '', categoryname: '', subcategory: '',
      oldprice: '', sellingPrice: '', discount: '', stock: '', highlights: '',
    });
    setDynamicAttributes({});
    setImages([]);
    setCurrentCategoryConfig(null);
    setFormError('');
    setSubmitMessage('');
  };

  if (sellerLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-center p-10 rounded-2xl shadow-xl max-w-xl">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-4">Pending Approval</h2>
          <p>Your seller account is pending approval. You'll be able to add products once approved.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 md:py-10  md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Add New Product
            </h1>
            <p className="text-gray-500 mt-1">Fill in the details to list your product</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                  <circle cx="24" cy="24" r="20" stroke={formCompletion >= 80 ? '#10b981' : '#3b82f6'}
                    strokeWidth="4" fill="none" strokeDasharray={`${(formCompletion / 100) * 126} 126`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{formCompletion}%</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Complete</span>
            </div>
            <Button variant="outlined" onClick={resetForm} className="!rounded-full !border-gray-300">Reset</Button>
          </div>
        </div>

        {/* Category Notice */}
        {currentCategoryConfig && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <Chip label={currentCategoryConfig.label} color="primary" size="small" />
            <span className="text-sm text-blue-700">
              Showing {currentCategoryConfig.fields?.length || 0} category-specific fields for better product listing
            </span>
          </div>
        )}

        <form onSubmit={addproduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-2">

            {/* Basic Info */}
            <FormCard color="border-blue-500" title="Basic Information" icon={<MdDescription className="text-blue-500" />}>
              <div className="space-y-5">
                <TextField
                  label={<span>Product Title <Req /></span>}
                  name="title"
                  fullWidth
                  value={coreProduct.title}
                  onChange={handleCoreChange}
                  placeholder="e.g. Premium Cotton T-Shirt - Round Neck"
                  helperText={`${coreProduct.title.length}/100 characters`}
                />
                <TextField
                  label={<span>Description <Req /></span>}
                  name="description"
                  multiline
                  rows={4}
                  fullWidth
                  value={coreProduct.description}
                  onChange={handleCoreChange}
                  placeholder="Describe your product in detail..."
                  helperText={`${coreProduct.description.length}/1000 characters (min 20)`}
                />
                <TextField
                  label="Key Highlights"
                  name="highlights"
                  multiline
                  rows={3}
                  fullWidth
                  value={coreProduct.highlights}
                  onChange={handleCoreChange}
                  placeholder="• Feature 1&#10;• Feature 2&#10;• Feature 3"
                />
              </div>
            </FormCard>

            {/* Dynamic Category-Specific Fields */}
            {currentCategoryConfig && currentCategoryConfig.fields?.length > 0 && (
              <FormCard
                color="border-purple-500"
                title={`${currentCategoryConfig.label} Details`}
                icon={<MdInfo className="text-purple-500" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCategoryConfig.fields.map((field) => (
                    <div key={field.name} className={field.type === FIELD_TYPES.TEXTAREA ? 'md:col-span-2' : ''}>
                      <DynamicField
                        field={field}
                        value={dynamicAttributes[field.name]}
                        onChange={handleDynamicChange}
                      />
                    </div>
                  ))}
                </div>
              </FormCard>
            )}

            {/* Common Fields */}
            <FormCard color="border-indigo-500" title="Additional Details" icon={<FiPackage className="text-indigo-500" />} toggleable collapsed>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMMON_FIELDS.map((field) => (
                  <div key={field.name}>
                    <DynamicField
                      field={field}
                      value={dynamicAttributes[field.name] || field.default || ''}
                      onChange={handleDynamicChange}
                    />
                  </div>
                ))}
              </div>
            </FormCard>

            {/* Images */}
            <FormCard color="border-pink-500" title="Product Images" icon={<MdOutlineCloudUpload className="text-pink-500" />}>
              <p className="text-sm text-gray-600 mb-4">Upload high-quality images. <strong>First image = Main display</strong></p>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p.url} className="w-24 h-24 object-cover rounded-xl border-2" alt={`Preview ${i}`} />
                    {i === 0 && <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded">MAIN</span>}
                    <button type="button" onClick={() => handleImageRemove(i)}
                      className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 text-sm hover:bg-pink-600">✕</button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="cursor-pointer">
                    <div className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-xl bg-pink-50 hover:bg-pink-100 hover:border-pink-500 transition-all">
                      <span className="text-2xl text-pink-400">+</span>
                      <span className="text-xs text-pink-400">Add</span>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
                      onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">{images.length}/{MAX_IMAGES} images {images.length === 0 && <span className="text-red-500">• Required</span>}</p>
            </FormCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Pricing */}
            <FormCard color="border-emerald-500" title="Pricing & Stock" icon={<MdAttachMoney className="text-emerald-500" />}>
              <div className="space-y-4">
                {/* MRP */}
                <TextField
                  label={<span>MRP (Maximum Retail Price) <Req /></span>}
                  type="number"
                  name="oldprice"
                  fullWidth
                  value={coreProduct.oldprice}
                  onChange={handleMrpChange}
                  InputProps={{ startAdornment: <span className="mr-1 text-gray-500">₹</span> }}
                  helperText="Enter the maximum retail price"
                />

                {/* Selling Price - Editable */}
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-emerald-700 font-bold uppercase">Selling Price <Req /></p>
                    {coreProduct.discount > 0 && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {coreProduct.discount}% OFF
                      </span>
                    )}
                  </div>
                  <TextField
                    type="number"
                    value={coreProduct.sellingPrice}
                    onChange={handleSellingPriceChange}
                    fullWidth
                    placeholder="Enter your selling price"
                    disabled={!coreProduct.oldprice}
                    InputProps={{
                      startAdornment: <span className="mr-1 text-emerald-600 font-bold">₹</span>,
                      style: { fontSize: '1.5rem', fontWeight: 'bold' }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {coreProduct.oldprice
                      ? 'Enter your selling price (discount will be auto-calculated)'
                      : 'Enter MRP first to set selling price'}
                  </p>
                </div>

                {/* Discount - Read-only but editable */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <TextField
                      label="Discount %"
                      type="number"
                      name="discount"
                      value={coreProduct.discount}
                      onChange={handleDiscountChange}
                      fullWidth
                      size="small"
                      disabled={!coreProduct.oldprice}
                      InputProps={{
                        endAdornment: <span className="text-gray-400">%</span>
                      }}
                      helperText="Or enter discount to calculate selling price"
                    />
                  </div>
                  {coreProduct.oldprice && coreProduct.sellingPrice && (
                    <div className="flex-1 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-semibold mb-1">Customer Savings</p>
                      <p className="text-lg font-bold text-amber-700">
                        ₹{Math.round(Number(coreProduct.oldprice) - Number(coreProduct.sellingPrice))}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stock */}
                <TextField
                  label={<span>Stock <Req /></span>}
                  type="number"
                  name="stock"
                  fullWidth
                  value={coreProduct.stock}
                  onChange={handleCoreChange}
                  helperText="Available units"
                />
              </div>
            </FormCard>

            {/* Category */}
            <FormCard color="border-orange-500" title="Category" icon={<MdCategory className="text-orange-500" />}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Category <Req /></label>
                  <div className="flex gap-2">
                    <Autocomplete fullWidth options={categories} getOptionLabel={(o) => o.categoryname}
                      value={categories.find(c => c._id === coreProduct.categoryname) || null}
                      onChange={(_, v) => setCoreProduct(prev => ({ ...prev, categoryname: v?._id || '' }))}
                      renderInput={(params) => <TextField {...params} placeholder="Select category" size="small" />} />
                    <Button variant="contained" className="!bg-orange-500 !min-w-[40px]" onClick={() => setOpenAddCategoryModal(true)}>+</Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subcategory <Req /></label>
                  <div className="flex gap-2">
                    <FormControl fullWidth size="small">
                      <Select value={coreProduct.subcategory} disabled={!coreProduct.categoryname}
                        onChange={(e) => setCoreProduct(prev => ({ ...prev, subcategory: e.target.value }))} displayEmpty>
                        <MenuItem value="" disabled>{coreProduct.categoryname ? 'Select subcategory' : 'Select category first'}</MenuItem>
                        {filteredSubcategories.map(s => <MenuItem key={s._id} value={s._id}>{s.subcategory}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Button variant="contained" className="!bg-orange-500 !min-w-[40px]" disabled={!coreProduct.categoryname}
                      onClick={() => setOpenAddSubCategoryModal(true)}>+</Button>
                  </div>
                </div>
              </div>
            </FormCard>

            {/* Messages */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <strong>Error:</strong> {formError}
              </div>
            )}
            {submitMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <MdCheckCircle className="text-xl" /> {submitMessage}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}
              className="!py-4 !text-lg !font-bold !rounded-2xl !shadow-lg !bg-gradient-to-r from-blue-600 to-purple-600 hover:!from-blue-700 hover:!to-purple-700"
              startIcon={<MdOutlineCloudUpload />}>
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </Button>
          </div>
        </form>

        {/* Modals */}
        <Modal open={openAddCategoryModal} onClose={() => { setOpenAddCategoryModal(false); fetchCategories(); }}>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px]">
            <AddCategory onClose={() => { setOpenAddCategoryModal(false); fetchCategories(); }} />
          </Box>
        </Modal>
        <Modal open={openAddSubCategoryModal} onClose={() => { setOpenAddSubCategoryModal(false); fetchSubcategories(); }}>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl w-[90%] sm:w-[500px]">
            <AddSubCategory onSubCategoryAdded={() => { setOpenAddSubCategoryModal(false); fetchSubcategories(); }} />
          </Box>
        </Modal>
      </div>
    </section>
  );
}

export default AddProduct;