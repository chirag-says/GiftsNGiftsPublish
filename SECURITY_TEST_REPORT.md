# 🔐 Security Test Strategy & Execution Report
## GiftNGifts E-Commerce Seller Panel

**Document Type:** QA Security Test Plan  
**Version:** 1.1 (UPDATED - FIXES APPLIED)  
**Date:** December 21, 2024  
**Author:** Lead QA Automation Engineer  
**Status:** ✅ ALL VULNERABILITIES FIXED  

---

## 📋 Executive Summary

This document outlines the security test strategy for the GiftNGifts MERN Stack Seller Panel. The tests focus on three critical vulnerability categories:

| Test ID | Vulnerability | Risk Level | Status | Fix Applied |
|---------|---------------|------------|--------|-------------|
| TC-A | Malicious File Upload | 🔴 Critical | ✅ FIXED | `middleware/multer.js` - File type validation |
| TC-B | Price Tampering | 🔴 Critical | ✅ FIXED | `controller/sellercontroller.js` - Price validation |
| TC-C | Auth Bypass (Suspended User) | 🔴 Critical | ✅ FIXED | `middleware/authseller.js` - Status checks |
| TC-D | NoSQL Injection | 🔴 Critical | ✅ FIXED | `controller/sellercontroller.js` - Email sanitization |

### ✅ Security Fixes Implemented:

1. **File Upload (TC-A)**: Added MIME type & extension validation in Multer
2. **Price Tampering (TC-B)**: Server-side price/discount validation with tolerance check
3. **Auth Bypass (TC-C)**: Middleware checks `isBlocked`, `status`, `verified`, `approved`
4. **NoSQL Injection (TC-D)**: Email sanitization with `validator.normalizeEmail()`
5. **JWT Security**: Added 7-day expiry to all tokens
6. **Error Handling**: Global error handler prevents leaking internal errors

---

## 🧪 Pre-requisites

### Environment Setup
```bash
# Ensure server is running
cd Server && npm run dev

# Backend URL (adjust if different)
BASE_URL="http://localhost:7000"
```

### Get Valid Seller Token (Required for all tests)
```bash
# Step 1: Login as a test seller
curl -X POST http://localhost:7000/api/seller/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testseller@example.com",
    "password": "TestPassword123"
  }'

# Save the returned token
SELLER_TOKEN="<paste_token_from_response>"
```

---

## 🧪 TEST CASE A: Malicious File Upload Attack

### Objective
Verify that the server rejects non-image file uploads (XSS/RCE prevention).

### Attack Vector
Attempt to upload an HTML file containing malicious JavaScript to the product images endpoint.

### Step 1: Create Malicious Test File
```bash
# Create exploit.html file
echo '<script>alert("XSS Attack!")</script>' > exploit.html
```

### Step 2: Execute Attack
```bash
curl -X POST http://localhost:7000/api/seller/addproducts \
  -H "stoken: $SELLER_TOKEN" \
  -F "title=Exploit Product" \
  -F "description=Test Description" \
  -F "price=100" \
  -F "categoryname=Test" \
  -F "subcategory=Test" \
  -F "stock=10" \
  -F "images=@exploit.html"
```

### Expected Results

| Outcome | Status Code | Response | Verdict |
|---------|-------------|----------|---------|
| ✅ PASS | 400 | `"Only image files allowed"` or similar rejection | SECURE |
| ❌ FAIL | 200 | Product created successfully | VULNERABLE |

### Verification Query (MongoDB)
```javascript
// Check if malicious file was stored
db.products.find({ title: "Exploit Product" })
// Should return empty or product without exploit.html
```

---

## 🧪 TEST CASE B: Price Tampering Attack

### Objective
Verify server-side price validation prevents sellers from manipulating prices/discounts.

### Attack Vector
Send a request with mathematically inconsistent price data:
- `oldPrice`: ₹1000
- `discount`: 10%
- `price`: ₹1 (should be ₹900)

### Execute Attack
```bash
curl -X POST http://localhost:7000/api/seller/addproducts \
  -H "stoken: $SELLER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Price Hack Product" \
  -F "description=Testing price manipulation" \
  -F "price=1" \
  -F "oldprice=1000" \
  -F "discount=10" \
  -F "categoryname=Test Category" \
  -F "subcategory=Test Sub" \
  -F "stock=50" \
  -F "images=@valid_test_image.jpg"
```

### Expected Results

| Outcome | Response | Database Value | Verdict |
|---------|----------|----------------|---------|
| ✅ PASS | 400 Error: "Price mismatch" | N/A (rejected) | SECURE |
| ❌ FAIL | 200 Success | `price: 1` in DB | VULNERABLE |

### Verification Query (MongoDB)
```javascript
// If product was created, check actual price stored
db.products.find({ title: "Price Hack Product" }).pretty()

// Expected: Should NOT exist, OR price should be ~900 (server-calculated)
// FAIL if: price === 1
```

### Additional Price Tampering Tests
```bash
# Test A: Negative Price
curl -X POST http://localhost:7000/api/seller/addproducts \
  -H "stoken: $SELLER_TOKEN" \
  -F "title=Negative Price Product" \
  -F "description=Test" \
  -F "price=-100" \
  -F "categoryname=Test" \
  -F "subcategory=Test" \
  -F "stock=10" \
  -F "images=@valid_test_image.jpg"
# Expected: 400 "Price must be a positive number"

# Test B: Discount > 99%
curl -X POST http://localhost:7000/api/seller/addproducts \
  -H "stoken: $SELLER_TOKEN" \
  -F "title=Invalid Discount Product" \
  -F "description=Test" \
  -F "price=100" \
  -F "oldprice=1000" \
  -F "discount=150" \
  -F "categoryname=Test" \
  -F "subcategory=Test" \
  -F "stock=10" \
  -F "images=@valid_test_image.jpg"
# Expected: 400 "Discount must be between 0 and 99%"

# Test C: Extreme Price (typo protection)
curl -X POST http://localhost:7000/api/seller/addproducts \
  -H "stoken: $SELLER_TOKEN" \
  -F "title=Extreme Price Product" \
  -F "description=Test" \
  -F "price=999999999" \
  -F "categoryname=Test" \
  -F "subcategory=Test" \
  -F "stock=10" \
  -F "images=@valid_test_image.jpg"
# Expected: 400 "Price exceeds maximum allowed limit"
```

---

## 🧪 TEST CASE C: Auth Bypass - Suspended User Access

### Objective
Verify that suspended/blocked sellers cannot access protected endpoints even with a valid JWT.

### Step 1: Login and Get Valid Token
```bash
# Login as test seller
curl -X POST http://localhost:7000/api/seller/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testseller@example.com",
    "password": "TestPassword123"
  }'

# Response: { "success": true, "token": "eyJhbG..." }
SELLER_TOKEN="<paste_token_here>"
```

### Step 2: Verify Normal Access Works
```bash
# Should return 200 with seller profile
curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: $SELLER_TOKEN"

# Expected: 200 OK with seller data
```

### Step 3: Suspend Seller in MongoDB
```javascript
// In MongoDB Compass or mongosh, run:
db.sellers.updateOne(
  { email: "testseller@example.com" },
  { $set: { status: "Suspended" } }
)

// Verify change
db.sellers.findOne({ email: "testseller@example.com" }, { status: 1, email: 1 })
// Should show: { status: "Suspended" }
```

### Step 4: Attempt Access with Same Token
```bash
# Try to access profile with the SAME token
curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: $SELLER_TOKEN"
```

### Expected Results

| Outcome | Status Code | Response | Verdict |
|---------|-------------|----------|---------|
| ✅ PASS | 403 | `"Your account has been suspended"` | SECURE |
| ❌ FAIL | 200 | Returns seller profile data | VULNERABLE |

### Additional Auth Bypass Tests
```bash
# Test A: Blocked User
# First, set isBlocked = true in MongoDB
db.sellers.updateOne(
  { email: "testseller@example.com" },
  { $set: { isBlocked: true } }
)

# Then test access
curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: $SELLER_TOKEN"
# Expected: 403 "Your account has been blocked"

# Test B: Unverified User  
db.sellers.updateOne(
  { email: "testseller@example.com" },
  { $set: { verified: false } }
)

curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: $SELLER_TOKEN"
# Expected: 403 "Please verify your email"

# Test C: Expired Token
# Use a token that was generated > 7 days ago
curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
# Expected: 401 "Token expired"

# Test D: Invalid Token Format
curl -X GET http://localhost:7000/api/seller/profile \
  -H "stoken: invalid_token_12345"
# Expected: 401 "Invalid token"

# Test E: Missing Token
curl -X GET http://localhost:7000/api/seller/profile
# Expected: 401 "Login again"
```

### Cleanup: Reset Test Seller
```javascript
// Reset seller to normal state after testing
db.sellers.updateOne(
  { email: "testseller@example.com" },
  { 
    $set: { 
      status: "Active",
      isBlocked: false,
      verified: true
    } 
  }
)
```

---

## 🔐 NoSQL Injection Test (Bonus)

### Objective
Verify email fields are sanitized to prevent NoSQL injection.

### Execute Attack
```bash
# Attempt NoSQL injection in login
curl -X POST http://localhost:7000/api/seller/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$gt": ""},
    "password": "anypassword"
  }'

# Expected: 400 or generic "Invalid credentials" (NOT exposing user data)
```

### Expected Results

| Outcome | Response | Verdict |
|---------|----------|---------|
| ✅ PASS | `"Invalid credentials"` or `"Invalid input format"` | SECURE |
| ❌ FAIL | Returns user data or different error | VULNERABLE |

---

## 📊 Test Results Summary Template

### Execute and Fill In:

| Test Case | Test ID | Status | Notes |
|-----------|---------|--------|-------|
| Malicious File Upload | TC-A | ⬜ PENDING | |
| Price Tampering | TC-B | ⬜ PENDING | |
| Negative Price | TC-B.1 | ⬜ PENDING | |
| Invalid Discount | TC-B.2 | ⬜ PENDING | |
| Extreme Price | TC-B.3 | ⬜ PENDING | |
| Suspended User Access | TC-C | ⬜ PENDING | |
| Blocked User Access | TC-C.1 | ⬜ PENDING | |
| Unverified User Access | TC-C.2 | ⬜ PENDING | |
| Expired Token | TC-C.3 | ⬜ PENDING | |
| Invalid Token | TC-C.4 | ⬜ PENDING | |
| Missing Token | TC-C.5 | ⬜ PENDING | |
| NoSQL Injection | TC-D | ⬜ PENDING | |

### Legend
- ✅ PASS - Security control working as expected
- ❌ FAIL - Vulnerability detected, requires immediate fix
- ⚠️ PARTIAL - Control exists but has gaps
- ⬜ PENDING - Not yet tested

---

## 🛠️ Postman Collection (Alternative)

If you prefer Postman, create a collection with these requests:

### Collection Structure:
```
📁 GNG Security Tests
├── 📁 Pre-requisites
│   └── POST Seller Login
├── 📁 TC-A: File Upload
│   └── POST Upload Malicious File
├── 📁 TC-B: Price Tampering
│   ├── POST Price=1 Attack
│   ├── POST Negative Price
│   ├── POST Invalid Discount
│   └── POST Extreme Price
├── 📁 TC-C: Auth Bypass
│   ├── GET Profile (Normal)
│   ├── GET Profile (After Suspend)
│   ├── GET Profile (Blocked)
│   ├── GET Profile (Expired Token)
│   └── GET Profile (No Token)
└── 📁 TC-D: Injection
    └── POST NoSQL Injection Login
```

### Postman Test Script Example:
```javascript
// Add to "Tests" tab for automated verification
pm.test("Should return 403 for suspended user", function () {
    pm.response.to.have.status(403);
});

pm.test("Should have error message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.message).to.include("suspended");
});
```

---

## ✅ Remediation Verification Checklist

After running tests, verify these controls exist:

- [ ] **File Upload**: Multer fileFilter checks file MIME type and extension
- [ ] **Price Validation**: Server calculates expected price from oldprice and discount
- [ ] **Auth Middleware**: Checks `seller.status`, `seller.isBlocked`, `seller.verified`
- [ ] **JWT Expiry**: Tokens have `expiresIn` set (e.g., "7d")
- [ ] **Input Sanitization**: Email normalized with `validator.normalizeEmail()`
- [ ] **Type Checking**: `typeof email === 'string'` before database queries
- [ ] **Error Handling**: Generic error messages in production (no stack traces)

---

## 📞 Escalation Path

| Severity | Finding | Action |
|----------|---------|--------|
| 🔴 Critical | Any FAIL result | Stop deployment, fix immediately |
| 🟡 Medium | Partial controls | Schedule fix within 1 sprint |
| 🟢 Low | Enhancement needed | Add to backlog |

---

**Document End**

*Generated for GiftNGifts Security Audit - December 2024*
