import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  createHive,
  listHives,
  getHiveById,
  joinHive,
  leaveHive,
} from '../controllers/hiveController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createHive);
router.get('/', listHives);
router.post('/join', joinHive);
router.get('/:id', getHiveById);
router.post('/:id/leave', leaveHive);

export default router;
