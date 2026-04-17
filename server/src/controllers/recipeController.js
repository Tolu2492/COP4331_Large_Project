// Recipe controller for saved recipes, external discovery, imports, favorites, and detail updates.
import asyncHandler from 'express-async-handler';
import Recipe from '../models/Recipe.js';
import { searchExternalRecipes, getExternalRecipeBySource } from '../utils/externalRecipeProviders.js';

export const listRecipes = asyncHandler(async (req, res) => {
  const { query = '', diet = '', cuisine = '', favorites = 'false' } = req.query;

  const filter = { userId: req.user._id };

  if (favorites === 'true') filter.isFavorite = true;
  if (diet) filter.dietaryTags = { $in: [diet] };
  if (cuisine) filter.cuisine = cuisine;

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { dietaryTags: { $elemMatch: { $regex: query, $options: 'i' } } },
      { cravingTags: { $elemMatch: { $regex: query, $options: 'i' } } },
      { cuisine: { $regex: query, $options: 'i' } }
    ];
  }

  const recipes = await Recipe.find(filter).sort({ updatedAt: -1 });
  res.json({ recipes });
});

export const discoverRecipes = asyncHandler(async (req, res) => {
  const { query = '', diet = '', cuisine = '', usePantry = 'false' } = req.query;
  const data = await searchExternalRecipes({
    userId: req.user._id,
    query: String(query),
    diet: String(diet),
    cuisine: String(cuisine),
    usePantry: usePantry === 'true'
  });
  res.json(data);
});

export const importRecipe = asyncHandler(async (req, res) => {
  const { source, externalId } = req.body;
  if (!source || !externalId) {
    res.status(400);
    throw new Error('Source and externalId are required.');
  }

  const externalRecipe = await getExternalRecipeBySource(source, externalId);

  const recipe = await Recipe.create({
    userId: req.user._id,
    title: externalRecipe.title,
    description: externalRecipe.description,
    cuisine: externalRecipe.cuisine,
    category: externalRecipe.category,
    dietaryTags: externalRecipe.dietaryTags,
    cravingTags: externalRecipe.cravingTags,
    cookTime: externalRecipe.cookTime,
    servings: externalRecipe.servings,
    ingredients: externalRecipe.ingredients,
    instructions: externalRecipe.instructions,
    imageUrl: externalRecipe.imageUrl,
    externalUrl: externalRecipe.externalUrl || '',
    isFavorite: false
  });

  res.status(201).json({ recipe, importedFrom: source });
});

export const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found.');
  }
  res.json({ recipe });
});

export const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.create({
    ...req.body,
    userId: req.user._id
  });
  res.status(201).json({ recipe });
});

export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found.');
  }

  Object.assign(recipe, req.body);
  await recipe.save();

  res.json({ recipe });
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found.');
  }

  await recipe.deleteOne();
  res.json({ message: 'Recipe deleted.' });
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user._id });
  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found.');
  }

  recipe.isFavorite = !recipe.isFavorite;
  await recipe.save();

  res.json({ recipe });
});
