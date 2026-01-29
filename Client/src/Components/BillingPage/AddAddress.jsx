import React, { useEffect, useState } from 'react';
import { TextField, Button, Radio, CircularProgress } from '@mui/material';
import api from "../../utils/api";
import Totalprice from '../Cart Page/Totalprice.jsx';
import { MdModeEdit, MdDelete, MdAddLocationAlt, MdOutlineHomeWork } from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function AddAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems;

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- Logic Kept Intact ---
  const getProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/user/profile');
      if (data.success) {
        setProfile(data.profile);
        setAddresses(data.profile.addresses || []);
        const defaultAddr = data.profile.addresses?.find(addr => addr.isDefaultBilling);
        if (defaultAddr && !selectedAddress) {
          setSelectedAddress(defaultAddr);
        }
      }
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { getProfile(); }, []);

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

    setIsSaving(true);
    try {
      if (editAddressId) {
        const { data } = await api.put(`/api/user/updateaddress/${editAddressId}`, { address: newAddress });
        if (data.success) toast.success("Address updated");
      } else {
        const { data } = await api.post('/api/user/addaddress', { address: newAddress });
        if (data.success) toast.success("Address added");
      }
      resetForm();
      getProfile();
      setShowAddForm(false);
    } catch (err) {
      toast.error("Error saving address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await api.delete(`/api/user/deleteaddress/${addressId}`, { data: { userId: profile.user || profile._id } });
      if (data.success) {
        toast.info("Address deleted");
        if (selectedAddress?._id === addressId) setSelectedAddress(null);
        getProfile();
      }
    } catch (error) { toast.error("Failed to delete"); }
  };

  const resetForm = () => {
    setNewAddress({ fullName: '', phoneNumber: '', address: '', city: '', state: '', pin: '', country: '', isDefaultBilling: false });
    setEditAddressId(null);
  };

  const handlePlaceOrder = () => {
    if (selectedAddress) {
      navigate("/ordersummery", { state: { selectedItems, selectedAddressId: selectedAddress._id } });
    } else {
      toast.error("Please select a delivery address!");
    }
  };

  const handleSelectAddress = (addr) => { setSelectedAddress(addr); };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 10) setNewAddress((prev) => ({ ...prev, [name]: onlyNums }));
    } else {
      setNewAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e, addr) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectAddress(addr);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F9F6F0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CircularProgress sx={{ color: '#B58D2F' }} />
          <p className="mt-4 font-serif text-[#544231] font-bold">Unfolding your saved locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F6F0] min-h-screen py-10 sm:py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left Part: Address Management */}
          <div className="lg:w-[68%] w-full order-2 lg:order-1">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#EDE3D2] p-6 sm:p-10">
              
              {/* Header with Signature Golden Line */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-[#322619] flex items-center gap-3">
                    <MdAddLocationAlt className="text-[#B58D2F]" /> Delivery Destination
                  </h2>
                  <div className="w-20 h-1 bg-[#B58D2F] mt-3"></div>
                </div>
                {!showAddForm && (
                  <Button
                    className="!capitalize !text-[#B58D2F] !border-[#B58D2F] hover:!bg-[#FDFBF7] !rounded-full !px-6 !py-2.5 !font-bold !border-2"
                    variant="outlined"
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                  >
                    + Add New Address
                  </Button>
                )}
              </div>

              {/* Address List */}
              <div className="space-y-6" role="radiogroup" aria-label="Select delivery address">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr._id}
                      role="radio"
                      aria-checked={selectedAddress?._id === addr._id}
                      tabIndex={0}
                      onClick={() => handleSelectAddress(addr)}
                      onKeyDown={(e) => handleKeyDown(e, addr)}
                      className={`relative flex items-start gap-5 p-6 rounded-[2rem] border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B58D2F] focus:ring-offset-4 ${
                        selectedAddress?._id === addr._id
                        ? "border-[#B58D2F] bg-[#FDFBF7] shadow-lg shadow-[#B58D2F]/5 scale-[1.01]"
                        : "border-[#EDE3D2] hover:border-[#B58D2F]/40"
                      }`}
                    >
                      <Radio
                        checked={selectedAddress?._id === addr._id}
                        className="!p-0 !mt-1"
                        sx={{ '&.Mui-checked': { color: '#B58D2F' } }}
                        tabIndex={-1}
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-serif text-xl font-bold text-[#322619]">{addr.fullName}</span>
                          <div className="flex gap-2">
                            {addr.isDefaultBilling && (
                              <span className="text-[9px] bg-[#B58D2F] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Default</span>
                            )}
                            <span className="text-[9px] bg-[#F9F6F0] text-[#544231] px-3 py-1 rounded-full border border-[#EDE3D2] font-black uppercase tracking-widest">Home</span>
                          </div>
                        </div>
                        <p className="text-sm text-[#544231] font-bold mb-2 tracking-tight">{addr.phoneNumber}</p>
                        <p className="text-sm text-[#544231]/70 leading-relaxed max-w-md font-medium">
                          {addr.address}, {addr.city}, {addr.state} — <span className="font-bold text-[#322619]">{addr.pin}</span>
                        </p>

                        {selectedAddress?._id === addr._id && (
                          <Button
                            variant="contained"
                            className="!mt-8 !bg-[#322619] !text-[#F9F6F0] !px-10 !py-3.5 !rounded-full !font-bold !capitalize !text-sm !shadow-xl hover:!bg-[#B58D2F] !transition-all"
                            onClick={(e) => { e.stopPropagation(); handlePlaceOrder(); }}
                          >
                            Deliver to this Address
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 border-l border-dashed border-[#EDE3D2] pl-4">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditAddressId(addr._id); setNewAddress({ ...addr }); setShowAddForm(true); }}
                          className="text-[#544231]/40 hover:text-[#B58D2F] p-2 transition-colors bg-[#F9F6F0] rounded-full"
                          aria-label="Edit"
                        >
                          <MdModeEdit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                          className="text-[#544231]/40 hover:text-red-500 p-2 transition-colors bg-[#F9F6F0] rounded-full"
                          aria-label="Delete"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-[#FDFBF7] rounded-[2rem] border-2 border-dashed border-[#EDE3D2]">
                    <p className="text-[#544231] font-serif text-lg opacity-60">No saved locations yet.</p>
                  </div>
                )}
              </div>

              {/* Form to Add/Edit */}
              {(showAddForm || editAddressId) && (
                <div className="mt-16 pt-12 border-t-2 border-dashed border-[#EDE3D2]">
                  <div className="flex items-center gap-3 mb-8 text-[#322619]">
                    <div className="p-2 bg-[#F9F6F0] rounded-lg">
                      <MdOutlineHomeWork className="text-2xl text-[#B58D2F]" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold">
                      {editAddressId ? 'Update Heritage Link' : 'New Address Details'}
                    </h3>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <TextField 
                      label="Full Name" name="fullName" value={newAddress.fullName} onChange={handleAddressChange} fullWidth required 
                    />
                    <TextField
                      label="Phone Number" name="phoneNumber" value={newAddress.phoneNumber} onChange={handleAddressChange} fullWidth required
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
                    />
                    <div className="md:col-span-2">
                      <TextField 
                        label="Address (House No, Building, Area)" name="address" value={newAddress.address} onChange={handleAddressChange} fullWidth multiline rows={3} required 
                       
                      />
                    </div>
                    <TextField label="City" name="city" value={newAddress.city} onChange={handleAddressChange} fullWidth required  />
                    <TextField label="State" name="state" value={newAddress.state} onChange={handleAddressChange} fullWidth required  />
                    <TextField label="Pincode" name="pin" value={newAddress.pin} onChange={handleAddressChange} fullWidth required  />
                    <TextField label="Country" name="country" value={newAddress.country} onChange={handleAddressChange} fullWidth required  />

                    <div className="md:col-span-2 flex items-center gap-6 mt-6">
                      <Button
                        type="submit"
                        variant="contained"
                        className="!bg-[#322619] !text-[#F9F6F0] !px-10 !py-4 !rounded-full !font-bold !capitalize !shadow-xl hover:!bg-[#B58D2F] !transition-all"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Processing...' : editAddressId ? 'Save Changes' : 'Record Address'}
                      </Button>
                      <Button
                        type="button"
                        className="!text-[#544231] !capitalize !font-bold hover:!underline"
                        onClick={() => { resetForm(); setShowAddForm(false); }}
                      >
                        Discard
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Part: Summary */}
          <div className="lg:w-[32%] w-full order-1 lg:order-2">
            <div className="lg:sticky lg:top-28">
               <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#322619]/5 border border-[#EDE3D2] p-8">
                  <Totalprice selectedItemIds={selectedItems} />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddAddress;