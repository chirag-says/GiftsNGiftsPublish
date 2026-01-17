import express from 'express';
import {
    getAllSupportData,
    getVendorMessages,
    replyToVendorMessage,
    updateMessageStatus,
    getSupportTickets,
    createSupportTicket,
    updateTicketStatus,
    replyToTicket,
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    getSmsTemplates,
    createSmsTemplate,
    updateSmsTemplate,
    deleteSmsTemplate,
    getHelpDocs,
    createHelpDoc,
    updateHelpDoc,
    deleteHelpDoc,
    incrementHelpDocViews,
    getTrainingResources,
    createTrainingResource,
    updateTrainingResource,
    deleteTrainingResource,
    getSystemStatus,
    updateSystemStatus,
    sendBulkEmail,
    sendBulkSms,
    getChatSessions
} from '../controller/supportController.js';
import adminAuth from '../middleware/authAdmin.js';

const router = express.Router();

// Main data endpoint - gets all support data in one call
router.get('/', adminAuth, getAllSupportData);

// Vendor Messages
router.get('/vendor-messages', adminAuth, getVendorMessages);
router.post('/vendor-messages/:id/reply', adminAuth, replyToVendorMessage);
router.put('/vendor-messages/:id/status', adminAuth, updateMessageStatus);

// Support Tickets
router.get('/tickets', adminAuth, getSupportTickets);
router.post('/tickets', adminAuth, createSupportTicket);
router.put('/ticket/:id', adminAuth, updateTicketStatus);
router.post('/ticket/:id/reply', adminAuth, replyToTicket);

// Announcements
router.get('/announcements', adminAuth, getAnnouncements);
router.post('/announcement', adminAuth, createAnnouncement);
router.put('/announcement/:id', adminAuth, updateAnnouncement);
router.delete('/announcement/:id', adminAuth, deleteAnnouncement);

// Email Templates
router.get('/email-templates', adminAuth, getEmailTemplates);
router.post('/email-template', adminAuth, createEmailTemplate);
router.put('/email-template/:id', adminAuth, updateEmailTemplate);
router.delete('/email-template/:id', adminAuth, deleteEmailTemplate);

// SMS Templates
router.get('/sms-templates', adminAuth, getSmsTemplates);
router.post('/sms-template', adminAuth, createSmsTemplate);
router.put('/sms-template/:id', adminAuth, updateSmsTemplate);
router.delete('/sms-template/:id', adminAuth, deleteSmsTemplate);

// Help Documentation
router.get('/help-docs', adminAuth, getHelpDocs);
router.post('/help-doc', adminAuth, createHelpDoc);
router.put('/help-doc/:id', adminAuth, updateHelpDoc);
router.delete('/help-doc/:id', adminAuth, deleteHelpDoc);
router.post('/help-doc/:id/view', adminAuth, incrementHelpDocViews);

// Training Resources
router.get('/training-resources', adminAuth, getTrainingResources);
router.post('/training-resource', adminAuth, createTrainingResource);
router.put('/training-resource/:id', adminAuth, updateTrainingResource);
router.delete('/training-resource/:id', adminAuth, deleteTrainingResource);

// System Status
router.get('/system-status', adminAuth, getSystemStatus);
router.put('/system-status', adminAuth, updateSystemStatus);

// Bulk Messaging (Contact Vendors)
router.post('/bulk-email', adminAuth, sendBulkEmail);
router.post('/bulk-sms', adminAuth, sendBulkSms);

// Chat Sessions
router.get('/chat-sessions', adminAuth, getChatSessions);

export default router;
