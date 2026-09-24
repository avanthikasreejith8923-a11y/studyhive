import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  searchUsers,
  sendFriendRequest,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelOrRemoveFriend,
} from '../controllers/friendController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getFriends);
router.get('/requests', getFriendRequests);
router.get('/search', searchUsers);
router.post('/request', sendFriendRequest);
router.put('/request/:id/accept', acceptFriendRequest);
router.put('/request/:id/reject', rejectFriendRequest);
router.delete('/request/:id/cancel', cancelOrRemoveFriend);

export default router;
