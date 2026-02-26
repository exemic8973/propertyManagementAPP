import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in Phase 3
router.get('/', (req, res) => {
  res.json({ message: 'Get all payments - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create payment - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get payment by ID - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update payment - to be implemented' });
});

export default router;
