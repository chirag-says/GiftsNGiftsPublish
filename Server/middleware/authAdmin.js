import jwt from 'jsonwebtoken';
import Admin from '../model/adminModel.js';

const adminAuth = async (req, res, next) => {

  let token;

  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } 
  // Check for token in cookies
  else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

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