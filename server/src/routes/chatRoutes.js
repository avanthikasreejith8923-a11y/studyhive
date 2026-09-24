import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getChatHistory, markChatRead } from '../controllers/chatController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:friendId', getChatHistory);
router.patch('/:friendId/read', markChatRead);

export default router;
