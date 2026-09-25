import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { chatWithAssistant } from '../controllers/assistantController.js';

const router = express.Router();

// Protected: Only authenticated users can chat with study assistant
router.post('/chat', requireAuth, chatWithAssistant);

export default router;
