import express from 'express'
import userAuth from '../middleware/userAuth.js';
import {
    addAddress,
    createProfile,
    deleteAddress,
    getProfile,
    getuserdeta,
    updateAddress,
    UpdateProfile,
    setDefaultBilling,
    getAddressById,
    getDefaultShippingAddress
} from '../controller/user_details_controller.js';

const userouter = express.Router();

userouter.get('/data', userAuth, getuserdeta);
userouter.get('/profile', userAuth, getProfile);
userouter.post('/updateprofile', userAuth, UpdateProfile);
userouter.get('/createprofile', userAuth, createProfile);

// Address routes
userouter.post('/addaddress', userAuth, addAddress);
userouter.put('/updateaddress/:addressId', userAuth, updateAddress);
userouter.delete('/deleteaddress/:addressId', userAuth, deleteAddress);
userouter.put('/setdefaultbilling/:addressId', userAuth, setDefaultBilling);

// SECURITY: New secure address endpoints (no localStorage)
userouter.get('/address/:addressId', userAuth, getAddressById);
userouter.get('/default-shipping-address', userAuth, getDefaultShippingAddress);

export default userouter;