import { Router } from 'express';
import { 
  getTenants, 
  getTenant, 
  createTenant, 
  updateTenant, 
  deleteTenant 
} from '../controllers/tenantController-dev';
import { authenticateToken } from '../middleware/auth-dev';

const router = Router();

// All tenant routes require authentication
router.use(authenticateToken);

// GET /api/tenants - Get all tenants (filtered by user role)
router.get('/', getTenants);

// GET /api/tenants/:id - Get specific tenant
router.get('/:id', getTenant);

// POST /api/tenants - Create new tenant
router.post('/', createTenant);

// PUT /api/tenants/:id - Update tenant
router.put('/:id', updateTenant);

// DELETE /api/tenants/:id - Delete tenant
router.delete('/:id', deleteTenant);

export default router;
