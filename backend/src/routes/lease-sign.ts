import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as leaseSignController from '../controllers/leaseSignController';

const router = Router();

// PDF download - supports token in query param (before auth middleware)
router.get('/documents/:id/pdf', leaseSignController.downloadPDF);

// All other routes require authentication
router.use(authenticateToken);

// Document CRUD
router.get('/documents', leaseSignController.getDocuments);
router.get('/documents/stats', leaseSignController.getStats);
router.get('/documents/:id', leaseSignController.getDocument);
router.post('/documents', leaseSignController.createDocument);
router.put('/documents/:id', leaseSignController.updateDocument);
router.delete('/documents/:id', leaseSignController.deleteDocument);

// Signature workflow
router.post('/documents/:id/send', leaseSignController.sendForSignature);
router.post('/documents/:id/void', leaseSignController.voidDocument);

// Comments
router.post('/documents/:id/comments', leaseSignController.addComment);

// Notifications
router.get('/notifications', leaseSignController.getNotifications);
router.put('/notifications/:notificationId/read', leaseSignController.markNotificationRead);

export default router;
