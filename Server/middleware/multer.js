/**
 * Secure File Upload Middleware - Enterprise Security Module
 * 
 * OWASP Compliance:
 * - MIME type whitelisting
 * - File extension whitelisting
 * - Magic byte verification (file header inspection)
 * - File size limits
 * - Filename sanitization
 * - Path traversal prevention
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

// Ensure upload directory exists
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/**
 * SECURITY: Allowed file types with magic byte signatures
 * 
 * ⚠️ BLOCKED FILE TYPES:
 * - SVG: Can contain <script> tags (XSS vulnerability)
 * - GIF: Animation and legacy exploit concerns
 * - HTML/PHP/JS: Executable content
 * 
 * ONLY SAFE IMAGE FORMATS ALLOWED:
 * - JPEG/JPG: Bitmap, no script support
 * - PNG: Bitmap, no script support  
 * - WebP: Modern format, no script support
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Magic bytes for file type verification
const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/webp': null // WebP uses RIFF container, checked via file-type library
};

/**
 * SECURITY: Dangerous file patterns to reject immediately
 */
const DANGEROUS_PATTERNS = [
  /\.svg$/i,        // SVG files - XSS risk
  /\.html?$/i,      // HTML files
  /\.php$/i,        // PHP files
  /\.js$/i,         // JavaScript files
  /\.exe$/i,        // Executables
  /\.bat$/i,        // Batch files
  /\.sh$/i,         // Shell scripts
  /\.cmd$/i,        // Windows command files
  /\.ps1$/i,        // PowerShell scripts
  /\.asp$/i,        // ASP files
  /\.jsp$/i,        // JSP files
  /\.cgi$/i,        // CGI scripts
  /\.phtml$/i,      // PHP files
  /\.\./,           // Path traversal attempt
  /%2e%2e/i,        // URL-encoded path traversal
];

/**
 * Sanitize filename - remove dangerous characters
 */
const sanitizeFilename = (filename) => {
  // Remove path components and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')  // Multiple dots
    .replace(/^\.+/, '')       // Leading dots
    .substring(0, 200);        // Max length
};

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalName) => {
  const sanitized = sanitizeFilename(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  const ext = path.extname(sanitized).toLowerCase();
  const base = path.basename(sanitized, ext);

  return `${timestamp}-${random}-${base}${ext}`;
};

// ========== STORAGE CONFIGURATION ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

// ========== MEMORY STORAGE FOR VALIDATION ==========
const memoryStorage = multer.memoryStorage();

/**
 * SECURITY: Pre-validation file filter (before any processing)
 */
const preValidationFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const originalName = file.originalname.toLowerCase();

  // Check for dangerous file patterns FIRST
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(originalName)) {
      return cb(new Error(`File type not allowed: Potentially dangerous file detected`), false);
    }
  }

  // Check declared MIME type (this can be spoofed, but adds a layer)
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`), false);
  }

  // Check file extension (primary check)
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Invalid file extension: ${ext}. Allowed extensions: .jpg, .jpeg, .png, .webp`), false);
  }

  // Check MIME-extension consistency
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

  cb(null, true);
};

/**
 * SECURITY: Magic byte verification middleware
 * Checks actual file content, not just headers/extension
 */
export const verifyMagicBytes = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.file ? [req.file] : (Array.isArray(req.files) ? req.files : Object.values(req.files).flat());

  try {
    for (const file of files) {
      let buffer;

      if (file.buffer) {
        // Memory storage
        buffer = file.buffer;
      } else if (file.path) {
        // Disk storage - read first bytes
        const fd = fs.openSync(file.path, 'r');
        buffer = Buffer.alloc(8192); // Read first 8KB for file type detection
        fs.readSync(fd, buffer, 0, 8192, 0);
        fs.closeSync(fd);
      } else {
        continue;
      }

      // Use file-type library for robust detection
      const detectedType = await fileTypeFromBuffer(buffer);

      if (!detectedType) {
        // Could not detect file type
        if (file.path) fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: 'Unable to verify file type. File may be corrupted or invalid.'
        });
      }

      if (!ALLOWED_MIME_TYPES.has(detectedType.mime)) {
        // File content doesn't match allowed types
        if (file.path) fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: `File content does not match an allowed image type. Detected: ${detectedType.mime}. This may indicate file type spoofing.`
        });
      }

      // Additional check: content type matches declared MIME type
      const declaredMime = file.mimetype.replace('image/jpg', 'image/jpeg');
      const detectedMime = detectedType.mime;

      if (declaredMime !== detectedMime) {
        console.warn(`SECURITY WARNING: MIME mismatch. Declared: ${declaredMime}, Detected: ${detectedMime}, File: ${file.originalname}`);
        // Allow this but log it - some edge cases exist with JPEG variants
      }
    }

    next();
  } catch (error) {
    console.error('Magic byte verification error:', error);
    // Clean up any uploaded files on error
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

// ========== MULTER CONFIGURATIONS ==========

/**
 * Standard upload configuration with strict security
 */
const uploadConfig = {
  storage,
  fileFilter: preValidationFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,    // 5MB max file size
    files: 10,                     // Max 10 files per request
    fieldNameSize: 100,            // Max field name length
    fieldSize: 1024 * 1024,        // 1MB max field value size
    headerPairs: 100               // Max number of header pairs
  }
};

/**
 * Memory-based upload for validation (stores file in memory for inspection)
 */
const memoryUploadConfig = {
  storage: memoryStorage,
  fileFilter: preValidationFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024
  }
};

// Create multer instances
const upload = multer(uploadConfig);
const memoryUpload = multer(memoryUploadConfig);

/**
 * SECURITY: Complete secure upload middleware chain
 * Combines multer upload with magic byte verification
 */
export const secureUpload = {
  single: (fieldName) => [
    upload.single(fieldName),
    verifyMagicBytes
  ],
  array: (fieldName, maxCount = 10) => [
    upload.array(fieldName, maxCount),
    verifyMagicBytes
  ],
  fields: (fields) => [
    upload.fields(fields),
    verifyMagicBytes
  ]
};

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files per upload.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
    }

    return res.status(400).json({
      success: false,
      message
    });
  }

  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};

export default upload;
