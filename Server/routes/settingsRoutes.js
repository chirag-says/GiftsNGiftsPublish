import express from 'express';
import {
    getAllSettingsData,
    getSiteConfig,
    updateSiteConfig,
    getPaymentGateways,
    updatePaymentGateway,
    togglePaymentGateway,
    getEmailSettings,
    updateEmailSettings,
    testEmailSettings,
    getSmsSettings,
    updateSmsSettings,
    getTaxConfig,
    updateTaxConfig,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getSecuritySettings,
    updateSecuritySettings,
    getGdprSettings,
    updateGdprSettings,
    getBackups,
    createBackup,
    deleteBackup,
    getBackupSettings,
    updateBackupSettings,
    getPersonalization,
    updatePersonalization,
    getMessageTemplates,
    createMessageTemplate,
    updateMessageTemplate,
    deleteMessageTemplate,
    getCustomization,
    updateCustomization,
    getGreetingCards,
    createGreetingCard,
    updateGreetingCard,
    deleteGreetingCard
} from '../controller/settingsController.js';
import adminAuth from '../middleware/authAdmin.js';

const router = express.Router();

// Main data endpoint - gets all settings data in one call
router.get('/', adminAuth, getAllSettingsData);

// Site Configuration
router.get('/site-config', adminAuth, getSiteConfig);
router.put('/site-config', adminAuth, updateSiteConfig);

// Payment Gateways
router.get('/payment-gateways', adminAuth, getPaymentGateways);
router.put('/payment-gateway/:gateway', adminAuth, updatePaymentGateway);
router.put('/payment-gateway/:gateway/toggle', adminAuth, togglePaymentGateway);

// Email Settings
router.get('/email-settings', adminAuth, getEmailSettings);
router.put('/email-settings', adminAuth, updateEmailSettings);
router.post('/email-settings/test', adminAuth, testEmailSettings);

// SMS Settings
router.get('/sms-settings', adminAuth, getSmsSettings);
router.put('/sms-settings', adminAuth, updateSmsSettings);

// Tax Configuration
router.get('/tax-config', adminAuth, getTaxConfig);
router.put('/tax-config', adminAuth, updateTaxConfig);

// API Management
router.get('/api-keys', adminAuth, getApiKeys);
router.post('/api-key', adminAuth, createApiKey);
router.delete('/api-key/:id', adminAuth, deleteApiKey);
router.put('/api-key/:id/toggle', adminAuth, toggleApiKey);

// User Permissions / Roles
router.get('/roles', adminAuth, getRoles);
router.post('/role', adminAuth, createRole);
router.put('/role/:id', adminAuth, updateRole);
router.delete('/role/:id', adminAuth, deleteRole);

// Security Settings
router.get('/security', adminAuth, getSecuritySettings);
router.put('/security', adminAuth, updateSecuritySettings);

// GDPR Compliance
router.get('/gdpr', adminAuth, getGdprSettings);
router.put('/gdpr', adminAuth, updateGdprSettings);

// Data Backup
router.get('/backups', adminAuth, getBackups);
router.post('/backup', adminAuth, createBackup);
router.delete('/backup/:id', adminAuth, deleteBackup);
router.get('/backup-settings', adminAuth, getBackupSettings);
router.put('/backup-settings', adminAuth, updateBackupSettings);

// Personalization Tools
router.get('/personalization', adminAuth, getPersonalization);
router.put('/personalization', adminAuth, updatePersonalization);

// Message Templates
router.get('/message-templates', adminAuth, getMessageTemplates);
router.post('/message-template', adminAuth, createMessageTemplate);
router.put('/message-template/:id', adminAuth, updateMessageTemplate);
router.delete('/message-template/:id', adminAuth, deleteMessageTemplate);

// Customization Settings
router.get('/customization', adminAuth, getCustomization);
router.put('/customization', adminAuth, updateCustomization);

// Greeting Cards
router.get('/greeting-cards', adminAuth, getGreetingCards);
router.post('/greeting-card', adminAuth, createGreetingCard);
router.put('/greeting-card/:id', adminAuth, updateGreetingCard);
router.delete('/greeting-card/:id', adminAuth, deleteGreetingCard);

export default router;
