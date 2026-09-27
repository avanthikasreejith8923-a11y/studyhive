import express from 'express';
import { updateTask, deleteTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateTask } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.patch('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

export default router;

