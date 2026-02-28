import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as templateController from '../controllers/templateController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Template CRUD
router.get('/templates', templateController.getTemplates);
router.get('/templates/default', templateController.getDefaultTemplate);
router.get('/templates/:id', templateController.getTemplate);
router.post('/templates', templateController.createTemplate);
router.put('/templates/:id', templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);
router.post('/templates/:id/duplicate', templateController.duplicateTemplate);
router.put('/templates/:id/default', templateController.setDefaultTemplate);

export default router;
