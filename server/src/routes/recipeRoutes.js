// Recipe route definitions for discovery, saved recipes, imports, favorites, and editing.
import express from 'express';
import {
  listRecipes,
  discoverRecipes,
  importRecipe,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite
} from '../controllers/recipeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', listRecipes);
router.get('/discover', discoverRecipes);
router.post('/', createRecipe);
router.post('/import', importRecipe);
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);
router.patch('/:id/favorite', toggleFavorite);

export default router;
