import jwt from 'jsonwebtoken';
import Admin from '../model/adminModel.js';

const adminAuth = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify admin exists and is not blocked
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found" });
    }
    
    if (admin.isBlocked) {
      return res.status(403).json({ success: false, message: "Admin account is blocked" });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;