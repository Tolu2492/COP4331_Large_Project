// MongoDB model for recipes saved in Garnish, including imported recipes and source links.
import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: String, default: '' }
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    cuisine: { type: String, default: 'General' },
    category: { type: String, default: 'Dinner' },
    dietaryTags: [{ type: String }],
    cravingTags: [{ type: String }],
    cookTime: { type: Number, default: 30 },
    servings: { type: Number, default: 2 },
    ingredients: [ingredientSchema],
    instructions: [{ type: String }],
    imageUrl: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

recipeSchema.index({ title: 'text', description: 'text', dietaryTags: 'text', cravingTags: 'text', cuisine: 'text' });

export default mongoose.model('Recipe', recipeSchema);
