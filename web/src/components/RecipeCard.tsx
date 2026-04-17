// Reusable recipe card used for both discovered recipes and recipes already saved in Garnish.
import { Link } from 'react-router-dom';
import type { ExternalRecipe, Recipe } from '../types';

type Props = {
  recipe: Recipe | ExternalRecipe;
  onSaveExternal?: (recipe: ExternalRecipe) => void;
  onToggleFavorite?: (recipe: Recipe) => void;
  importedRecipeId?: string;
};

function getRecipeTone(recipe: Recipe) {
  if (recipe.dietaryTags.includes('vegan')) return 'recipe-image vegan';
  if (recipe.dietaryTags.includes('kosher')) return 'recipe-image kosher';
  if (recipe.category.toLowerCase() === 'dessert') return 'recipe-image dessert';
  return 'recipe-image';
}

function isExternal(recipe: Recipe | ExternalRecipe): recipe is ExternalRecipe {
  return 'externalId' in recipe;
}

function getBadgeLabel(recipe: Recipe | ExternalRecipe) {
  return recipe.dietaryTags[0] || recipe.category || 'recipe';
}

export default function RecipeCard({ recipe, onSaveExternal, onToggleFavorite, importedRecipeId }: Props) {
  let backgroundStyle;
  if (recipe.imageUrl) {
    backgroundStyle = {
      backgroundImage: `linear-gradient(rgba(17, 24, 16, 0.18), rgba(17, 24, 16, 0.62)), url(${recipe.imageUrl})`
    };
  }

  const saved = Boolean(importedRecipeId);
  const externalRecipe = isExternal(recipe);

  let cardActions;
  if (externalRecipe) {
    if (saved) {
      let savedLink = null;
      if (importedRecipeId) {
        savedLink = (
          <Link className="ghost-btn inline-btn" to={`/recipes/${importedRecipeId}`}>
            View recipe
          </Link>
        );
      }

      cardActions = (
        <>
          <button className="success-btn inline-btn" type="button" disabled>
            Recipe saved
          </button>
          {savedLink}
        </>
      );
    } else {
      cardActions = (
        <button className="primary-btn inline-btn" type="button" onClick={() => onSaveExternal?.(recipe)}>
          Save to recipes
        </button>
      );
    }
  } else {
    let favoriteLabel = 'Favorite';
    if (recipe.isFavorite) {
      favoriteLabel = 'Unfavorite';
    }

    cardActions = (
      <>
        <Link className="primary-btn inline-btn" to={`/recipes/${recipe._id || 'demo'}`}>
          View recipe
        </Link>
        <button className="ghost-btn inline-btn" type="button" onClick={() => onToggleFavorite?.(recipe)}>
          {favoriteLabel}
        </button>
      </>
    );
  }

  let cravingLabel = 'everyday';
  if (recipe.cravingTags[0]) {
    cravingLabel = recipe.cravingTags[0];
  }

  let metaCraving = 'flexible';
  if (recipe.cravingTags.join(', ')) {
    metaCraving = recipe.cravingTags.join(', ');
  }

  return (
    <article className="card recipe-card">
      <div className={getRecipeTone(recipe)} aria-hidden="true" style={backgroundStyle}>
        <div className="image-overlay">{recipe.category}</div>
        <div className="recipe-image-copy">
          <span>{recipe.cuisine}</span>
          <strong>{cravingLabel}</strong>
        </div>
      </div>
      <div className="card-body">
        <div className="card-row card-row-start">
          <div>
            <h3>{recipe.title}</h3>
            <p className="card-subtitle">{recipe.cuisine} · {recipe.category}</p>
          </div>
          <span className="badge">{getBadgeLabel(recipe)}</span>
        </div>
        <p>{recipe.description}</p>
        <div className="meta-row">
          <span>{recipe.cookTime} min</span>
          <span>{recipe.servings} servings</span>
          <span>{metaCraving}</span>
        </div>
        <div className="card-actions">{cardActions}</div>
      </div>
    </article>
  );
}
