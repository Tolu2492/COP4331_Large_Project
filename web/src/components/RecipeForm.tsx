// Shared recipe form used when creating or editing a recipe.
import { useEffect, useState } from 'react';
import type { Recipe } from '../types';

type Props = {
  initialRecipe: Recipe;
  onSubmit: (recipe: Recipe) => Promise<void>;
};

function parseIngredientLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^([\d/.,\s+-]+\s+(?:cup|cups|tbsp|tsp|teaspoon|teaspoons|tablespoon|tablespoons|oz|ounce|ounces|lb|lbs|g|kg|ml|l|pinch|clove|cloves|slice|slices|can|cans|package|packages|item|items)?)\s+(.+)$/i);
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }

  return { amount: '', name: trimmed };
}

export default function RecipeForm({ initialRecipe, onSubmit }: Props) {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);

  useEffect(() => {
    setRecipe(initialRecipe);
  }, [initialRecipe]);

  return (
    <form
      className="form-grid card"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(recipe);
      }}
    >
      <div className="field">
        <label>Recipe Title</label>
        <input
          value={recipe.title}
          onChange={(event) => setRecipe({ ...recipe, title: event.target.value })}
          required
        />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          rows={4}
          value={recipe.description}
          onChange={(event) => setRecipe({ ...recipe, description: event.target.value })}
        />
      </div>

      <div className="two-col">
        <div className="field">
          <label>Cuisine</label>
          <input
            value={recipe.cuisine}
            onChange={(event) => setRecipe({ ...recipe, cuisine: event.target.value })}
          />
        </div>

        <div className="field">
          <label>Category</label>
          <input
            value={recipe.category}
            onChange={(event) => setRecipe({ ...recipe, category: event.target.value })}
          />
        </div>
      </div>

      <div className="two-col">
        <div className="field">
          <label>Dietary Tags (comma separated)</label>
          <input
            value={recipe.dietaryTags.join(', ')}
            onChange={(event) =>
              setRecipe({
                ...recipe,
                dietaryTags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
              })
            }
          />
        </div>

        <div className="field">
          <label>Cravings / Search Keywords</label>
          <input
            value={recipe.cravingTags.join(', ')}
            onChange={(event) =>
              setRecipe({
                ...recipe,
                cravingTags: event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
              })
            }
          />
        </div>
      </div>

      <div className="two-col">
        <div className="field">
          <label>Cook Time</label>
          <input
            type="number"
            min={1}
            value={recipe.cookTime}
            onChange={(event) => setRecipe({ ...recipe, cookTime: Number(event.target.value) })}
          />
        </div>

        <div className="field">
          <label>Servings</label>
          <input
            type="number"
            min={1}
            value={recipe.servings}
            onChange={(event) => setRecipe({ ...recipe, servings: Number(event.target.value) })}
          />
        </div>
      </div>

      <div className="field">
        <label>Ingredients</label>
        <textarea
          rows={6}
          value={recipe.ingredients.map((item) => `${item.amount} ${item.name}`.trim()).join('\n')}
          onChange={(event) =>
            setRecipe({
              ...recipe,
              ingredients: event.target.value
                .split('\n')
                .map(parseIngredientLine)
                .filter(Boolean) as Recipe['ingredients']
            })
          }
        />
      </div>

      <div className="field">
        <label>Instructions</label>
        <textarea
          rows={7}
          value={recipe.instructions.join('\n')}
          onChange={(event) =>
            setRecipe({
              ...recipe,
              instructions: event.target.value.split('\n').map((step) => step.trim()).filter(Boolean)
            })
          }
        />
      </div>

      <button className="primary-btn" type="submit">Save Recipe</button>
    </form>
  );
}
