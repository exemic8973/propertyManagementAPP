import { Router } from 'express';
import {
  getLeases,
  getLease,
  createLease,
  updateLease,
  deleteLease,
  terminateLease,
  signLease,
  getLeaseStats,
  initiateEsign,
  getLeaseForSigning,
  submitSignature,
  downloadLeasePDF
} from '../controllers/leaseController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (no auth required for signing)
router.get('/sign/:token', getLeaseForSigning);
router.post('/sign/:token', submitSignature);

// PDF download - handles its own auth (supports both middleware and query param token)
router.get('/:id/pdf', downloadLeasePDF);

// All other routes require authentication
router.use(authenticateToken);

// Lease routes
router.get('/', getLeases);
router.get('/stats', getLeaseStats);
router.get('/:id', getLease);
router.post('/', createLease);
router.post('/:id/initiate-esign', initiateEsign);
router.post('/:id/terminate', terminateLease);
router.put('/:id', updateLease);
router.delete('/:id', deleteLease);
router.post('/:id/sign', signLease);

export default router;