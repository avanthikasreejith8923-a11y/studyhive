import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminStats,
  getAdminUsers,
  toggleBanUser,
  toggleAdminRole,
  getAdminHives,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require both a valid login token AND admin status
router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/ban', toggleBanUser);
router.patch('/users/:id/role', toggleAdminRole);
router.get('/hives', getAdminHives);

export default router;
