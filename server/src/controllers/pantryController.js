// Pantry controller for the user's ingredient inventory and pantry item lifecycle actions.
import asyncHandler from 'express-async-handler';
import PantryItem from '../models/PantryItem.js';

export const listPantryItems = asyncHandler(async (req, res) => {
  const items = await PantryItem.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  res.json({ items });
});

export const createPantryItem = asyncHandler(async (req, res) => {
  const item = await PantryItem.create({
    ...req.body,
    userId: req.user._id
  });
  res.status(201).json({ item });
});

export const deletePantryItem = asyncHandler(async (req, res) => {
  const item = await PantryItem.findOne({ _id: req.params.id, userId: req.user._id });
  if (!item) {
    res.status(404);
    throw new Error('Pantry item not found.');
  }

  await item.deleteOne();
  res.json({ message: 'Pantry item removed.' });
});
