import React, { useEffect, useState } from 'react';
import { TextField, Button, Radio } from '@mui/material';
import axios from 'axios';
import Totalprice from '../Cart Page/Totalprice.jsx';
import { MdModeEdit, MdDelete, MdAddLocationAlt, MdOutlineHomeWork } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AddAddress() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', phone: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    country: '',
    isDefaultBilling: false,
  });
  const [editAddressId, setEditAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const token = localStorage.getItem('token');

  const getProfile = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        headers: { token },
      });
      if (data.success) {
        setProfile(data.profile);
        setAddresses(data.profile.addresses || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = addresses.some((addr) => (
      addr.fullName === newAddress.fullName &&
      addr.address === newAddress.address &&
      addr._id !== editAddressId
    ));

    if (isDuplicate) {
      toast.warning("This address already exists.");
      return;
    }

    try {
      if (editAddressId) {
        const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/user/updateaddress/${editAddressId}`,
          { userId: profile.user || profile._id, address: newAddress },
          { headers: { token } }
        );
        if (data.success) toast.success("Address updated successfully");
      } else {
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/addaddress`,
          { address: newAddress },
          { headers: { token } }
        );
        if (data.success) toast.success("Address added successfully");
      }
      resetForm();
      getProfile();
      setShowAddForm(false);
    } catch (err) {
      toast.error("Error saving address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/deleteaddress/${addressId}`,
        { data: { userId: profile.user || profile._id }, headers: { token } }
      );
      if (data.success) {
        toast.info("Address deleted");
        getProfile();
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setNewAddress({ fullName: '', phoneNumber: '', address: '', city: '', state: '', pin: '', country: '', isDefaultBilling: false });
    setEditAddressId(null);
  };

  const handlePlaceOrder = () => {
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
      navigate("/ordersummery");
    } else {
      toast.error("Please select a delivery address!");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Part: Address Management */}
          <div className="lg:w-[70%] w-full order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MdAddLocationAlt className="text-[#fb541b] text-2xl" /> Delivery Address
                </h2>
                {!showAddForm && (
                  <Button
                    className="!capitalize !text-[#fb541b] !border-[#fb541b] hover:!bg-orange-50 !rounded-lg"
                    variant="outlined"
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                  >
                    + Add New Address
                  </Button>
                )}
              </div>

              {/* Address List */}
              <div className="space-y-4">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div 
                      key={addr._id} 
                      onClick={() => setSelectedAddress(addr)}
                      className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-gray-300 transition-all cursor-pointer ${
                        selectedAddress?._id === addr._id 
                        ? " bg-orange-50/20" 
                        : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <Radio
                        checked={selectedAddress?._id === addr._id}
                        className="!p-0 !mt-1"
                        sx={{ '&.Mui-checked': { color: '#fb541b' } }}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{addr.fullName}</span>
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-widest">Home</span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium mb-1">{addr.phoneNumber}</p>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                          {addr.address}, {addr.city}, {addr.state} - <span className="font-bold text-gray-700">{addr.pin}</span>
                        </p>
                        
                        {selectedAddress?._id === addr._id && (
                          <Button
                            variant="contained"
                            className="!mt-5 !bg-[#fb541b] !shadow-lg !shadow-orange-100 !px-8 !py-2 !rounded-lg !font-bold !capitalize"
                            onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
                          >
                            Deliver to this Address
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditAddressId(addr._id); setNewAddress({...addr}); setShowAddForm(true); }}
                          className="text-gray-400 hover:text-blue-500 p-1 transition-colors"
                        >
                          <MdModeEdit size={20} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">No saved addresses found. Please add one.</p>
                  </div>
                )}
              </div>

              {/* Form to Add/Edit */}
              {(showAddForm || editAddressId) && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-6 text-gray-800">
                     <MdOutlineHomeWork className="text-xl" />
                     <h3 className="text-lg font-bold">
                      {editAddressId ? 'Update Address' : 'New Address Detail'}
                    </h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                    <TextField label="Full Name" name="fullName" value={newAddress.fullName} onChange={handleAddressChange} fullWidth size="small" required />
                    <TextField label="Phone Number" name="phoneNumber" value={newAddress.phoneNumber} onChange={handleAddressChange} fullWidth size="small" required />
                    <div className="md:col-span-2">
                      <TextField label="Address (House No, Building, Area)" name="address" value={newAddress.address} onChange={handleAddressChange} fullWidth size="small" multiline rows={2} required />
                    </div>
                    <TextField label="City" name="city" value={newAddress.city} onChange={handleAddressChange} fullWidth size="small" required />
                    <TextField label="State" name="state" value={newAddress.state} onChange={handleAddressChange} fullWidth size="small" required />
                    <TextField label="Pincode" name="pin" value={newAddress.pin} onChange={handleAddressChange} fullWidth size="small" required />
                    <TextField label="Country" name="country" value={newAddress.country} onChange={handleAddressChange} fullWidth size="small" required />
                    
                    <div className="md:col-span-2 flex items-center gap-4 mt-4">
                      <Button type="submit" variant="contained" className="!bg-[#fb541b] !px-8 !py-2.5 !rounded-lg !font-bold !capitalize !shadow-none">
                        {editAddressId ? 'Save Changes' : 'Save Address'}
                      </Button>
                      <Button variant="text" className="!text-gray-400 !capitalize hover:!bg-transparent" onClick={() => { resetForm(); setShowAddForm(false); }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Part: Summary */}
          <div className="lg:w-[30%] w-full order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <Totalprice />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddAddress;