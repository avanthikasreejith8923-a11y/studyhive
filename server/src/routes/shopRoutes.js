import express from 'express';
import { getCatalog, purchaseItem, equipItem } from '../controllers/shopController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/items', getCatalog);
router.post('/purchase', purchaseItem);
router.put('/equip', equipItem);

export default router;
