import { Router } from 'express';
import * as leaseSignController from '../controllers/leaseSignController';

const router = Router();

// Public signing routes (no authentication required - token-based access)
router.get('/sign/:token', leaseSignController.getDocumentForSigning);
router.post('/sign/:token', leaseSignController.submitSignatureForSigning);

export default router;
