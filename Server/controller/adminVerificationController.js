/**
 * Admin Verification Controller
 * Handles document review, seller verification, and approval workflows
 */

import sellermodel from "../model/sellermodel.js";

// ==================== GET PENDING VERIFICATIONS ====================

/**
 * Get all sellers pending verification
 */
export const getPendingVerifications = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = {};

        if (status === 'pending') {
            query.status = { $in: ['Pending', 'UnderReview'] };
        } else if (status === 'verified') {
            query.status = 'Active';
            query['verificationStatus.isFullyVerified'] = true;
        } else if (status === 'rejected') {
            query['verificationStatus.rejectionReason'] = { $ne: '' };
        } else {
            // Default: show all under review
            query.status = { $in: ['Pending', 'UnderReview', 'PartiallyVerified'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sellers = await sellermodel.find(query)
            .select('uniqueId name email nickName phone businessInfo.businessName businessInfo.businessType status verificationStatus onboardingCompleted createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await sellermodel.countDocuments(query);

        res.json({
            success: true,
            data: sellers,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                hasMore: skip + sellers.length < total
            }
        });
    } catch (error) {
        console.error("Get pending verifications error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Get seller details for verification
 */
export const getSellerVerificationDetails = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const seller = await sellermodel.findById(sellerId)
            .select('-password -otp -otpExpire -resetOtp -resetOtpExpire');

        if (!seller) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Calculate completion percentage
        let completionScore = 0;
        let docsPendingReview = 0;
        let docsVerified = 0;
        let docsRejected = 0;

        // Count document statuses
        const documentGroups = ['kycDocuments', 'taxDocuments', 'documents'];
        const checkDocStatus = (doc) => {
            if (doc?.status === 'pending_review') docsPendingReview++;
            if (doc?.status === 'verified') docsVerified++;
            if (doc?.status === 'rejected') docsRejected++;
        };

        // KYC Documents
        if (seller.kycDocuments) {
            checkDocStatus(seller.kycDocuments.aadhaarCard);
            checkDocStatus(seller.kycDocuments.panCard);
            checkDocStatus(seller.kycDocuments.passportOrVoterId);
            checkDocStatus(seller.kycDocuments.partnershipDeed);
            checkDocStatus(seller.kycDocuments.certificateOfIncorporation);
            checkDocStatus(seller.kycDocuments.moaAoa);
            checkDocStatus(seller.kycDocuments.llpAgreement);
            checkDocStatus(seller.kycDocuments.boardResolution);
        }

        // Tax Documents
        if (seller.taxDocuments) {
            checkDocStatus(seller.taxDocuments.gstCertificate);
            checkDocStatus(seller.taxDocuments.msmeUdyamCertificate);
            checkDocStatus(seller.taxDocuments.tradeLicense);
        }

        // Legacy Documents
        if (seller.documents) {
            checkDocStatus(seller.documents.identityProof);
            checkDocStatus(seller.documents.businessLogo);
            checkDocStatus(seller.documents.addressProof);
        }

        res.json({
            success: true,
            seller,
            verificationSummary: {
                docsPendingReview,
                docsVerified,
                docsRejected,
                completionPercentage: seller.verificationStatus?.completionPercentage || 0,
                isFullyVerified: seller.verificationStatus?.isFullyVerified || false,
            }
        });
    } catch (error) {
        console.error("Get seller verification details error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================== DOCUMENT VERIFICATION ====================

/**
 * Verify a specific document
 */
export const verifyDocument = async (req, res) => {
    try {
        const { sellerId, documentPath, action, rejectionReason } = req.body;

        if (!sellerId || !documentPath || !action) {
            return res.status(400).json({
                success: false,
                message: "sellerId, documentPath, and action are required"
            });
        }

        if (!['verify', 'reject'].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        if (action === 'reject' && !rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        const updateData = {
            [`${documentPath}.status`]: action === 'verify' ? 'verified' : 'rejected',
            [`${documentPath}.reviewedAt`]: new Date(),
            [`${documentPath}.reviewedBy`]: req.admin._id,
        };

        if (action === 'reject') {
            updateData[`${documentPath}.rejectionReason`] = rejectionReason;
        }

        const seller = await sellermodel.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        res.json({
            success: true,
            message: `Document ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
        });
    } catch (error) {
        console.error("Verify document error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Bulk verify documents
 */
export const bulkVerifyDocuments = async (req, res) => {
    try {
        const { sellerId, documentPaths, action, rejectionReason } = req.body;

        if (!sellerId || !documentPaths || !Array.isArray(documentPaths) || !action) {
            return res.status(400).json({
                success: false,
                message: "sellerId, documentPaths array, and action are required"
            });
        }

        const updateData = {};
        const now = new Date();

        documentPaths.forEach(path => {
            updateData[`${path}.status`] = action === 'verify' ? 'verified' : 'rejected';
            updateData[`${path}.reviewedAt`] = now;
            updateData[`${path}.reviewedBy`] = req.admin._id;
            if (action === 'reject' && rejectionReason) {
                updateData[`${path}.rejectionReason`] = rejectionReason;
            }
        });

        const seller = await sellermodel.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { new: true }
        );

        res.json({
            success: true,
            message: `${documentPaths.length} documents ${action === 'verify' ? 'verified' : 'rejected'}`,
        });
    } catch (error) {
        console.error("Bulk verify documents error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================== SELLER VERIFICATION ====================

/**
 * Verify seller (mark as fully verified)
 */
export const verifySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const seller = await sellermodel.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Check if mandatory requirements are met
        const errors = [];

        if (!seller.businessInfo?.panNumber) {
            errors.push("PAN number not provided");
        }

        if (!seller.bankDetails?.accountNumber) {
            errors.push("Bank details not provided");
        }

        if (!seller.declarations?.termsAccepted) {
            errors.push("Terms not accepted");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot verify seller - missing requirements",
                errors
            });
        }

        // Update seller status
        await sellermodel.findByIdAndUpdate(sellerId, {
            status: 'Active',
            approved: true,
            'verificationStatus.isFullyVerified': true,
            'verificationStatus.verifiedAt': new Date(),
            'verificationStatus.verifiedBy': req.admin._id,
            'verificationStatus.kycVerified': true,
            'verificationStatus.basicInfoVerified': true,
        });

        res.json({
            success: true,
            message: "Seller verified and activated successfully"
        });
    } catch (error) {
        console.error("Verify seller error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Partially verify seller
 */
export const partiallyVerifySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { verifiedSections, notes } = req.body;

        const updateData = {
            status: 'PartiallyVerified',
        };

        if (verifiedSections?.basicInfo) {
            updateData['verificationStatus.basicInfoVerified'] = true;
        }
        if (verifiedSections?.kyc) {
            updateData['verificationStatus.kycVerified'] = true;
        }
        if (verifiedSections?.taxDocs) {
            updateData['verificationStatus.taxDocsVerified'] = true;
        }
        if (verifiedSections?.bank) {
            updateData['verificationStatus.bankVerified'] = true;
        }

        const seller = await sellermodel.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { new: true }
        );

        res.json({
            success: true,
            message: "Seller partially verified",
            verificationStatus: seller.verificationStatus
        });
    } catch (error) {
        console.error("Partially verify seller error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Reject seller with reason
 */
export const rejectSeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required" });
        }

        await sellermodel.findByIdAndUpdate(sellerId, {
            status: 'Suspended',
            approved: false,
            'verificationStatus.isFullyVerified': false,
            'verificationStatus.rejectionReason': rejectionReason,
        });

        res.json({
            success: true,
            message: "Seller rejected"
        });
    } catch (error) {
        console.error("Reject seller error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Request additional documents from seller
 */
export const requestAdditionalDocuments = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { requiredDocuments, message } = req.body;

        if (!requiredDocuments || !Array.isArray(requiredDocuments)) {
            return res.status(400).json({ success: false, message: "Required documents list is needed" });
        }

        // Here you would typically:
        // 1. Store the request in the seller's record
        // 2. Send an email/notification to the seller
        // For now, we'll just update the status

        await sellermodel.findByIdAndUpdate(sellerId, {
            status: 'Pending',
            'verificationStatus.rejectionReason': `Additional documents required: ${requiredDocuments.join(', ')}. ${message || ''}`
        });

        res.json({
            success: true,
            message: "Document request sent to seller"
        });
    } catch (error) {
        console.error("Request additional documents error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================== VERIFICATION STATS ====================

/**
 * Get verification statistics
 */
export const getVerificationStats = async (req, res) => {
    try {
        const stats = await sellermodel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const pendingDocs = await sellermodel.countDocuments({
            $or: [
                { 'kycDocuments.aadhaarCard.status': 'pending_review' },
                { 'kycDocuments.panCard.status': 'pending_review' },
                { 'taxDocuments.gstCertificate.status': 'pending_review' },
                { 'documents.identityProof.status': 'pending_review' },
            ]
        });

        const statusCounts = {
            pending: 0,
            underReview: 0,
            partiallyVerified: 0,
            active: 0,
            suspended: 0
        };

        stats.forEach(item => {
            switch (item._id) {
                case 'Pending': statusCounts.pending = item.count; break;
                case 'UnderReview': statusCounts.underReview = item.count; break;
                case 'PartiallyVerified': statusCounts.partiallyVerified = item.count; break;
                case 'Active': statusCounts.active = item.count; break;
                case 'Suspended': statusCounts.suspended = item.count; break;
            }
        });

        res.json({
            success: true,
            stats: {
                ...statusCounts,
                pendingDocumentReviews: pendingDocs,
                totalSellers: Object.values(statusCounts).reduce((a, b) => a + b, 0)
            }
        });
    } catch (error) {
        console.error("Get verification stats error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Manually verify PAN (for admin override)
 */
export const manuallyVerifyPan = async (req, res) => {
    try {
        const { sellerId } = req.params;

        await sellermodel.findByIdAndUpdate(sellerId, {
            'verificationStatus.panVerified': true,
            'verificationStatus.panVerifiedAt': new Date(),
        });

        res.json({
            success: true,
            message: "PAN manually verified"
        });
    } catch (error) {
        console.error("Manually verify PAN error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Manually verify GST (for admin override)
 */
export const manuallyVerifyGst = async (req, res) => {
    try {
        const { sellerId } = req.params;

        await sellermodel.findByIdAndUpdate(sellerId, {
            'verificationStatus.gstVerified': true,
            'verificationStatus.gstVerifiedAt': new Date(),
        });

        res.json({
            success: true,
            message: "GST manually verified"
        });
    } catch (error) {
        console.error("Manually verify GST error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Manually verify bank (for admin override)
 */
export const manuallyVerifyBank = async (req, res) => {
    try {
        const { sellerId } = req.params;

        await sellermodel.findByIdAndUpdate(sellerId, {
            'bankDetails.isBankVerified': true,
            'bankDetails.verifiedAt': new Date(),
            'verificationStatus.bankVerified': true,
        });

        res.json({
            success: true,
            message: "Bank manually verified"
        });
    } catch (error) {
        console.error("Manually verify bank error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
