import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { FiUser, FiPhone, FiMail, FiMapPin, FiSave } from 'react-icons/fi';

function BasicInfoStep({ onComplete }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        // Registered Address
        street: '',
        city: '',
        state: '',
        pincode: '',
        // Communication Address
        sameAsRegistered: true,
        commStreet: '',
        commCity: '',
        commState: '',
        commPincode: '',
        // Contact Person
        contactPersonName: '',
        contactPersonDesignation: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/api/seller/profile');
            if (data.success && data.seller) {
                const seller = data.seller;
                setFormData(prev => ({
                    ...prev,
                    name: seller.name || '',
                    email: seller.email || '',
                    phone: seller.phone || '',
                    alternatePhone: seller.alternatePhone || '',
                    street: seller.address?.street || '',
                    city: seller.address?.city || '',
                    state: seller.address?.state || '',
                    pincode: seller.address?.pincode || '',
                    sameAsRegistered: seller.communicationAddress?.sameAsRegistered ?? true,
                    commStreet: seller.communicationAddress?.street || '',
                    commCity: seller.communicationAddress?.city || '',
                    commState: seller.communicationAddress?.state || '',
                    commPincode: seller.communicationAddress?.pincode || '',
                    contactPersonName: seller.contactPerson?.name || '',
                    contactPersonDesignation: seller.contactPerson?.designation || '',
                    contactPersonPhone: seller.contactPerson?.phone || '',
                    contactPersonEmail: seller.contactPerson?.email || '',
                }));
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim whitespace and convert to string for accurate length check
    const phoneStr = formData.phone ? formData.phone.toString().trim() : "";

    // Validation
    if (!formData.name || !phoneStr || !formData.street || !formData.city || !formData.state || !formData.pincode) {
        toast.error('Please fill all required fields');
        return;
    }

    if (phoneStr.length !== 10) {
        toast.error('Phone number must be 10 digits');
        return;
    }

    setSaving(true);
    try {
        // Agar aapka backend JSON accept karta hai toh normal object bhejein
        // Agar FormData hi chahiye toh ye format rakhein:
        const updateData = new FormData();
        updateData.append('name', formData.name);
        updateData.append('phone', phoneStr);
        updateData.append('alternatePhone', formData.alternatePhone);
        updateData.append('street', formData.street);
        updateData.append('city', formData.city);
        updateData.append('state', formData.state);
        updateData.append('pincode', formData.pincode);
        
        // Agar communication address bhi bhejna hai toh yahan append karein...

        await api.post('/api/seller/updateprofile', updateData);
        toast.success('Basic info saved successfully');
        onComplete && onComplete();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
        setSaving(false);
    }
};
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiUser className="text-indigo-500" /> Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                </div>
            </div>

            {/* Contact Numbers */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiPhone className="text-indigo-500" /> Contact Numbers
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, phone: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            required
                        />
                        {formData.phone && formData.phone.length !== 10 && (
                            <p className="text-xs text-amber-600 mt-1">{formData.phone.length}/10 digits</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alternate Phone
                        </label>
                        <input
                            type="tel"
                            name="alternatePhone"
                            value={formData.alternatePhone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, alternatePhone: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Alternate number (optional)"
                            maxLength={10}
                        />
                    </div>
                </div>
            </div>

            {/* Registered Address */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMapPin className="text-indigo-500" /> Registered Address
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="House/Building No., Street, Area"
                            required
                        />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="City"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select State</option>
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                <option value="Assam">Assam</option>
                                <option value="Bihar">Bihar</option>
                                <option value="Chhattisgarh">Chhattisgarh</option>
                                <option value="Goa">Goa</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Haryana">Haryana</option>
                                <option value="Himachal Pradesh">Himachal Pradesh</option>
                                <option value="Jharkhand">Jharkhand</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Manipur">Manipur</option>
                                <option value="Meghalaya">Meghalaya</option>
                                <option value="Mizoram">Mizoram</option>
                                <option value="Nagaland">Nagaland</option>
                                <option value="Odisha">Odisha</option>
                                <option value="Punjab">Punjab</option>
                                <option value="Rajasthan">Rajasthan</option>
                                <option value="Sikkim">Sikkim</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Telangana">Telangana</option>
                                <option value="Tripura">Tripura</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                <option value="Uttarakhand">Uttarakhand</option>
                                <option value="West Bengal">West Bengal</option>
                                <option value="Delhi">Delhi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData(prev => ({ ...prev, pincode: value }));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="6-digit pincode"
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Person (Optional) */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMail className="text-indigo-500" /> Contact Person (Optional)
                </h3>
                <p className="text-sm text-gray-500 mb-4">Add a contact person for business communications</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="contactPersonName"
                            value={formData.contactPersonName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Contact person name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <input
                            type="text"
                            name="contactPersonDesignation"
                            value={formData.contactPersonDesignation}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Manager, Partner"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            name="contactPersonPhone"
                            value={formData.contactPersonPhone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, contactPersonPhone: value }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Contact phone"
                            maxLength={10}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="contactPersonEmail"
                            value={formData.contactPersonEmail}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Contact email"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save & Continue'}
                </button>
            </div>
        </form>
    );
}

export default BasicInfoStep;
