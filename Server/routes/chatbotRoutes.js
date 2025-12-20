import express from 'express';
import {
    createOrResumeSession,
    getChatSessionById,
    getChatSessionsForUser,
    handleChatMessage,
    closeChatSession
} from '../controller/chatbotController.js';

const router = express.Router();

router.post('/session', createOrResumeSession);
router.get('/session/:sessionId', getChatSessionById);
router.get('/sessions', getChatSessionsForUser);
router.post('/message', handleChatMessage);
router.post('/session/:sessionId/close', closeChatSession);

export default router;
