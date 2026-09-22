import express from 'express';
import { updateTask, deleteTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
