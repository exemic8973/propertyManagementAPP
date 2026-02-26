import { Router } from 'express';

const router = Router();

// Placeholder routes - will be implemented in Phase 3
router.get('/', (req, res) => {
  res.json({ message: 'Get all properties - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create property - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get property by ID - to be implemented' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update property - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete property - to be implemented' });
});

export default router;
