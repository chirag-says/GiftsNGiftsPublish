/**
 * User Details Controller
 * 
 * SECURITY HARDENED:
 * - All functions use req.userId from auth middleware
 * - NO reliance on req.body.userId (IDOR prevention)
 * - Mass Assignment protection on profile updates
 * - Input validation and sanitization
 */

import usermodel from "../model/mongobd_usermodel.js";
import Profile from "../model/userprofile.js";
import { handleError, isValidObjectId } from "../utils/errorHandler.js";

/**
 * Get User Data
 * SECURITY: Uses req.userId from auth middleware
 */
export const getuserdeta = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await usermodel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerify: user.isAccountVerify
      }
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch user data");
  }
};

/**
 * Get User Profile
 * SECURITY: Uses req.userId from auth middleware
 * Auto-creates profile if missing (backward compatibility)
 */
export const getProfile = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let profile = await Profile.findOne({ user: userId });

    // AUTO-CREATE: If profile doesn't exist, create from User data
    if (!profile) {
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      profile = new Profile({
        user: userId,
        name: user.name || '',
        email: user.email || '',
        phone: '',
        addresses: []
      });
      await profile.save();
    }

    res.json({ success: true, profile });
  } catch (error) {
    handleError(res, error, "Failed to fetch profile");
  }
};

/**
 * Create User Profile
 * SECURITY: Uses req.userId from auth middleware
 */
export const createProfile = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { phone } = req.body;

    const exists = await Profile.findOne({ user: userId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    // Sanitize phone input
    const sanitizedPhone = typeof phone === 'string'
      ? phone.trim().slice(0, 15)
      : '';

    const profile = new Profile({
      user: userId,
      phone: sanitizedPhone
    });
    await profile.save();

    res.status(201).json({ success: true, profile });
  } catch (error) {
    handleError(res, error, "Failed to create profile");
  }
};

/**
 * Update User Profile
 * 
 * SECURITY:
 * - Uses req.userId from auth middleware (NOT req.body.userId)
 * - Mass Assignment Prevention: Only whitelisted fields allowed
 * - Input sanitization
 * 
 * BLOCKED FIELDS (never modifiable):
 * - role, isBlocked, isAdmin, isAccountVerify
 * - _id, user, createdAt, updatedAt
 */
export const UpdateProfile = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware ONLY
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Explicit destructuring - ONLY these fields allowed
    const { name, phone, email } = req.body;

    // SECURITY: Type validation
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid name format'
      });
    }
    if (phone !== undefined && typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format'
      });
    }
    if (email !== undefined && typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Build update object with sanitized values
    const updateData = {};
    if (name !== undefined) {
      updateData.name = String(name).trim().slice(0, 100);
    }
    if (phone !== undefined) {
      updateData.phone = String(phone).trim().slice(0, 15);
    }
    if (email !== undefined) {
      updateData.email = String(email).trim().toLowerCase().slice(0, 255);
    }

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      profile = new Profile({
        user: userId,
        name: updateData.name || user.name || '',
        email: updateData.email || user.email || '',
        phone: updateData.phone || '',
        addresses: []
      });
      await profile.save();
    } else {
      // Update only allowed fields
      if (updateData.name !== undefined) profile.name = updateData.name;
      if (updateData.phone !== undefined) profile.phone = updateData.phone;
      if (updateData.email !== undefined) profile.email = updateData.email;
      await profile.save();
    }

    res.json({ success: true, message: "Profile updated", profile });
  } catch (error) {
    handleError(res, error, "Failed to update profile");
  }
};

/**
 * Add Address
 * SECURITY: Uses req.userId from auth middleware
 */
export const addAddress = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { address } = req.body;

    if (!address || typeof address !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid address object required'
      });
    }

    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Limit addresses per user
    if (profile.addresses.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 addresses allowed'
      });
    }

    profile.addresses.push(address);
    await profile.save();

    res.status(201).json({
      success: true,
      addresses: profile.addresses
    });
  } catch (error) {
    handleError(res, error, "Failed to add address");
  }
};

/**
 * Update Address
 * SECURITY:
 * - Uses req.userId from auth middleware
 * - IDOR Protection: Verifies address belongs to authenticated user
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Validate addressId format
    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
      });
    }

    const { address } = req.body;

    if (!address || typeof address !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid address object required'
      });
    }

    // SECURITY: Query with userId for IDOR protection
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const targetAddress = profile.addresses.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // SECURITY: Whitelist allowed fields for address update
    const allowedFields = ['name', 'phone', 'street', 'city', 'state', 'pincode', 'landmark', 'type', 'isDefaultBilling'];
    for (const field of allowedFields) {
      if (address[field] !== undefined) {
        targetAddress[field] = address[field];
      }
    }

    await profile.save();

    res.json({ success: true, address: targetAddress });
  } catch (error) {
    handleError(res, error, "Failed to update address");
  }
};

/**
 * Delete Address
 * SECURITY:
 * - Uses req.userId from auth middleware
 * - IDOR Protection: Only own addresses can be deleted
 */
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Validate addressId format
    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
      });
    }

    // SECURITY: Query with userId for IDOR protection
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const originalLength = profile.addresses.length;
    profile.addresses = profile.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    if (profile.addresses.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await profile.save();

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    handleError(res, error, "Failed to delete address");
  }
};

/**
 * Set Default Billing Address
 * SECURITY: Uses req.userId from auth middleware
 */
export const setDefaultBilling = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;
    const { addressId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Validate addressId format
    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
      });
    }

    // SECURITY: Query with userId for IDOR protection
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify address exists in user's profile
    const addressExists = profile.addresses.some(
      addr => addr._id.toString() === addressId
    );
    if (!addressExists) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    profile.addresses = profile.addresses.map((addr) => ({
      ...addr.toObject(),
      isDefaultBilling: addr._id.toString() === addressId,
    }));

    await profile.save();

    res.json({ success: true, message: 'Default billing address updated' });
  } catch (error) {
    handleError(res, error, "Failed to set default billing");
  }
};

/**
 * Get Address by ID
 * SECURITY:
 * - Uses req.userId from auth middleware
 * - IDOR Protection: Verifies address belongs to user
 */
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Validate addressId format
    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID format'
      });
    }

    // SECURITY: Query with userId for IDOR protection
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const address = profile.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({ success: true, address });
  } catch (error) {
    handleError(res, error, "Failed to fetch address");
  }
};

/**
 * Get Default Shipping Address
 * SECURITY: Uses req.userId from auth middleware
 */
export const getDefaultShippingAddress = async (req, res) => {
  try {
    // SECURITY: Use authenticated userId from middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // SECURITY: Query with userId for IDOR protection
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!profile.addresses || profile.addresses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No addresses found'
      });
    }

    // Find default or fall back to first address
    const defaultAddress = profile.addresses.find(addr => addr.isDefaultBilling)
      || profile.addresses[0];

    res.json({ success: true, address: defaultAddress });
  } catch (error) {
    handleError(res, error, "Failed to fetch default address");
  }
};