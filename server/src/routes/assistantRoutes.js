import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { assistantLimiter } from '../middleware/rateLimitMiddleware.js';
import { chatWithAssistant } from '../controllers/assistantController.js';

const router = express.Router();

// Protected & Rate-limited: Only authenticated users can chat with study assistant
router.post('/chat', requireAuth, assistantLimiter, chatWithAssistant);

export default router;

