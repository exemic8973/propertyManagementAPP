import { Router } from 'express';
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
  recordLatePayment
} from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Payment routes
router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/:id', getPayment);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.post('/late/:lease_id', recordLatePayment);

export default router;