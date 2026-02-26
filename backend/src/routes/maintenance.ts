import { Router } from 'express';
import {
  getMaintenanceRequests,
  getMaintenanceRequest,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  assignMaintenanceRequest,
  getMaintenanceStats
} from '../controllers/maintenanceController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Maintenance routes
router.get('/', getMaintenanceRequests);
router.get('/stats', getMaintenanceStats);
router.get('/:id', getMaintenanceRequest);
router.post('/', createMaintenanceRequest);
router.put('/:id', updateMaintenanceRequest);
router.delete('/:id', deleteMaintenanceRequest);
router.put('/:id/assign', assignMaintenanceRequest);

export default router;