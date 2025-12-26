import usermodel from "../model/mongobd_usermodel.js";
import Profile from "../model/userprofile.js";
//Get all user data after register or login all of aperaton------
export const getuserdeta = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await usermodel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'user not found' });
    }
    res.json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerify: user.isAccountVerify
      }
    })

  } catch (error) {
    res.json({ success: false, message: error.message });
  }

}

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    let profile = await Profile.findOne({ user: userId });

    // AUTO-CREATE PROFILE: If profile doesn't exist, create one from User data
    // This handles users who registered before the profile creation was added
    if (!profile) {
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Create profile with data from User model
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
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createProfile = async (req, res) => {
  try {
    const { userId, phone } = req.body;

    const exists = await Profile.findOne({ user: userId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Profile already exists' });
    }

    const profile = new Profile({ user: userId, phone });
    await profile.save();
    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error("Create Profile Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const { userId, name, phone, email } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    let profile = await Profile.findOne({ user: userId });

    // If profile doesn't exist, create one
    if (!profile) {
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      profile = new Profile({
        user: userId,
        name: name || user.name || '',
        email: email || user.email || '',
        phone: phone || '',
        addresses: []
      });
      await profile.save();
    } else {
      // Update existing profile
      Object.assign(profile, updateData);
      await profile.save();
    }

    res.json({ success: true, message: "Profile updated", profile });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.addresses.push(address);
    await profile.save();

    res.status(201).json({ success: true, addresses: profile.addresses });
  } catch (error) {
    console.error("Add Address Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId, address } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const targetAddress = profile.addresses.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    Object.assign(targetAddress, address);
    await profile.save();

    res.json({ success: true, address: targetAddress });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.addresses = profile.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await profile.save();

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const setDefaultBilling = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.addresses = profile.addresses.map((addr) => ({
      ...addr.toObject(),
      isDefaultBilling: addr._id.toString() === addressId,
    }));

    await profile.save();

    res.json({ success: true, message: 'Default billing address updated' });
  } catch (error) {
    console.error("Set Default Billing Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * SECURITY: Get a specific address by ID
 * This replaces the insecure localStorage.getItem("selectedAddress") pattern
 * Verifies that the address belongs to the authenticated user
 */
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const address = profile.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, address });
  } catch (error) {
    console.error("Get Address By ID Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * SECURITY: Get user's default shipping address
 * Used as fallback when no specific address is selected
 * Returns the first address with isDefaultBilling=true, or the first address
 */
export const getDefaultShippingAddress = async (req, res) => {
  try {
    const { userId } = req.body;

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (!profile.addresses || profile.addresses.length === 0) {
      return res.status(404).json({ success: false, message: 'No addresses found' });
    }

    // Find default billing address, or fall back to first address
    const defaultAddress = profile.addresses.find(addr => addr.isDefaultBilling)
      || profile.addresses[0];

    res.json({ success: true, address: defaultAddress });
  } catch (error) {
    console.error("Get Default Shipping Address Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};