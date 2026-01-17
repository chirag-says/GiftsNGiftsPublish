import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWizard } from '../AddProductWizard';
import { MdPhotoLibrary, MdCloudUpload, MdDelete, MdStar, MdWarning, MdCheck, MdImage, MdZoomIn, MdInfo } from 'react-icons/md';

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

function StepImages() {
    const { productData, updateProductData, errors } = useWizard();
    const [dragActive, setDragActive] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFiles = useCallback((files) => {
        if (!files?.length) return;

        setUploadError('');
        const availableSlots = MAX_IMAGES - productData.images.length;

        if (availableSlots <= 0) {
            setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Invalid format`);
            } else if (file.size > MAX_SIZE) {
                errors.push(`${file.name}: File too large`);
            } else if (validFiles.length < availableSlots) {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setUploadError(errors.join(', '));
        }

        if (validFiles.length > 0) {
            updateProductData('images', [...productData.images, ...validFiles]);
        }
    }, [productData.images, updateProductData]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileInput = useCallback((e) => {
        processFiles(e.target.files);
        e.target.value = '';
    }, [processFiles]);

    const handleRemove = useCallback((index) => {
        updateProductData('images', productData.images.filter((_, i) => i !== index));
        setUploadError('');
    }, [productData.images, updateProductData]);

    const handleSetMain = useCallback((index) => {
        if (index === 0) return;
        const newImages = [...productData.images];
        const [removed] = newImages.splice(index, 1);
        newImages.unshift(removed);
        updateProductData('images', newImages);
    }, [productData.images, updateProductData]);

    const imagePreviews = useMemo(() =>
        productData.images.map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
        })),
        [productData.images]);

    React.useEffect(() => {
        return () => imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    }, [imagePreviews]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white mb-4 shadow-lg shadow-pink-500/25">
                    <MdPhotoLibrary size={28} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Product Images</h2>
                <p className="text-gray-500 mt-2 text-sm">Upload high-quality images to showcase your product</p>
            </div>

            {/* Guidelines */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-blue-50 rounded-xl p-4 border border-blue-100"
            >
                <div className="flex items-start gap-3">
                    <MdInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="font-semibold text-blue-800 text-sm mb-2">Image Guidelines</h4>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-700">
                            <li className="flex items-center gap-1.5">
                                <MdCheck className="text-blue-500" size={12} /> High resolution (1000x1000px+)
                            </li>
                            <li className="flex items-center gap-1.5">
                                <MdCheck className="text-blue-500" size={12} /> Clean background
                            </li>
                            <li className="flex items-center gap-1.5">
                                <MdCheck className="text-blue-500" size={12} /> Multiple angles
                            </li>
                            <li className="flex items-center gap-1.5">
                                <MdCheck className="text-blue-500" size={12} /> JPG, PNG, WebP (max 5MB)
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Error Messages */}
            {(errors.images || uploadError) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2"
                >
                    <MdWarning className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-red-700 text-sm">{errors.images || uploadError}</p>
                </motion.div>
            )}

            <div className="max-w-4xl mx-auto">
                {/* Image Previews */}
                {productData.images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-600">
                                {productData.images.length} of {MAX_IMAGES} images
                            </p>
                            <div className="h-1.5 w-28 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-pink-500 transition-all duration-300"
                                    style={{ width: `${(productData.images.length / MAX_IMAGES) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            <AnimatePresence>
                                {imagePreviews.map((preview, index) => (
                                    <motion.div
                                        key={preview.url}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={`relative group rounded-lg overflow-hidden border-2 ${index === 0 ? 'border-pink-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <div className="aspect-square">
                                            <img
                                                src={preview.url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {index === 0 && (
                                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                                                <MdStar size={10} /> MAIN
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                            {index !== 0 && (
                                                <button
                                                    onClick={() => handleSetMain(index)}
                                                    className="px-2 py-1 bg-white text-gray-800 text-[10px] font-medium rounded hover:bg-gray-100 transition-colors"
                                                >
                                                    Set as Main
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemove(index)}
                                                className="px-2 py-1 bg-red-500 text-white text-[10px] font-medium rounded hover:bg-red-600 transition-colors flex items-center gap-0.5"
                                            >
                                                <MdDelete size={10} /> Remove
                                            </button>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                                            <p className="text-white text-[10px]">{preview.size}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {productData.images.length < MAX_IMAGES && (
                                <label className="cursor-pointer">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-pink-300 transition-all flex flex-col items-center justify-center"
                                    >
                                        <MdCloudUpload className="text-gray-400 mb-1" size={24} />
                                        <span className="text-[10px] text-gray-500 font-medium">Add More</span>
                                    </motion.div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        hidden
                                        onChange={handleFileInput}
                                    />
                                </label>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Drop Zone */}
                {productData.images.length < MAX_IMAGES && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                    >
                        <label className="cursor-pointer block p-10">
                            <div className="text-center">
                                <motion.div
                                    animate={{ y: dragActive ? -5 : 0 }}
                                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-colors ${dragActive ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}
                                >
                                    <MdCloudUpload size={28} />
                                </motion.div>

                                <h3 className={`text-base font-semibold mb-1 transition-colors ${dragActive ? 'text-pink-600' : 'text-gray-700'
                                    }`}>
                                    {dragActive ? 'Drop images here' : 'Drag & drop images'}
                                </h3>

                                <p className="text-gray-500 text-sm mb-4">or</p>

                                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white font-medium text-sm rounded-lg hover:bg-pink-600 transition-colors">
                                    <MdPhotoLibrary size={18} />
                                    Browse Files
                                </span>

                                <p className="text-[11px] text-gray-400 mt-4">
                                    JPG, PNG, WebP • Max 5MB • Up to {MAX_IMAGES - productData.images.length} more
                                </p>
                            </div>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                hidden
                                onChange={handleFileInput}
                            />
                        </label>
                    </motion.div>
                )}

                {/* Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 grid grid-cols-3 gap-3"
                >
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                            <MdStar className="text-emerald-600" size={16} />
                        </div>
                        <h4 className="font-medium text-gray-800 text-xs mb-1">Main Image</h4>
                        <p className="text-[11px] text-gray-500">First image is your primary display</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                            <MdZoomIn className="text-amber-600" size={16} />
                        </div>
                        <h4 className="font-medium text-gray-800 text-xs mb-1">Show Scale</h4>
                        <p className="text-[11px] text-gray-500">Include size reference</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                            <MdImage className="text-purple-600" size={16} />
                        </div>
                        <h4 className="font-medium text-gray-800 text-xs mb-1">Details Matter</h4>
                        <p className="text-[11px] text-gray-500">Close-ups of craftsmanship</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default StepImages;
