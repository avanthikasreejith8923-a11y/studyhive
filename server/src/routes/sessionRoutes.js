import express from 'express';
import {
  createSession,
  updateSession,
  getSessionHistory,
  getSessionById,
} from '../controllers/sessionController.js';
import { getTasks, createTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createSession);
router.get('/', getSessionHistory);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);

// Session tasks endpoints
router.get('/:sessionId/tasks', getTasks);
router.post('/:sessionId/tasks', createTask);

export default router;
