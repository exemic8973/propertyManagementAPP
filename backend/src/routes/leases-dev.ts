import { Router } from 'express';
import { 
  getLeases, 
  getLease, 
  createLease, 
  updateLease, 
  deleteLease 
} from '../controllers/leaseController-dev';
import { authenticateToken } from '../middleware/auth-dev';

const router = Router();

// All lease routes require authentication
router.use(authenticateToken);

// GET /api/leases - Get all leases (filtered by user role)
router.get('/', getLeases);

// GET /api/leases/:id - Get specific lease
router.get('/:id', getLease);

// POST /api/leases - Create new lease
router.post('/', createLease);

// PUT /api/leases/:id - Update lease
router.put('/:id', updateLease);

// DELETE /api/leases/:id - Delete lease
router.delete('/:id', deleteLease);

export default router;
