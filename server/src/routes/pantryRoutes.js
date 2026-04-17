// Pantry route definitions for listing, creating, updating, and deleting pantry items.
import express from 'express';
import { listPantryItems, createPantryItem, deletePantryItem } from '../controllers/pantryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listPantryItems);
router.post('/', createPantryItem);
router.delete('/:id', deletePantryItem);

export default router;
