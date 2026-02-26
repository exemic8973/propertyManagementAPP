import { Router } from 'express';
import { 
  getProperties, 
  getProperty, 
  createProperty, 
  updateProperty, 
  deleteProperty 
} from '../controllers/propertyController-dev';
import { authenticateToken } from '../middleware/auth-dev';

const router = Router();

// All property routes require authentication
router.use(authenticateToken);

// GET /api/properties - Get all properties (filtered by user role)
router.get('/', getProperties);

// GET /api/properties/:id - Get specific property
router.get('/:id', getProperty);

// POST /api/properties - Create new property
router.post('/', createProperty);

// PUT /api/properties/:id - Update property
router.put('/:id', updateProperty);

// DELETE /api/properties/:id - Delete property
router.delete('/:id', deleteProperty);

export default router;
