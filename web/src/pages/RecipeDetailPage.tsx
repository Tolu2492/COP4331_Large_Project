// Recipe detail page that shows instructions, ingredients, and source links for imported recipes.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { confirmDelete } from '../lib/deleteConfirmation';
import type { Recipe } from '../types';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    api<{ recipe: Recipe }>(`/api/recipes/${id}`)
      .then((data) => setRecipe(data.recipe))
      .catch((error) => setMessage((error as Error).message));
  }, [id]);

  if (!recipe) {
    let loadingMessage = null;
    if (message) {
      loadingMessage = <p>{message}</p>;
    }

    return <section className="card empty-card"><h2>Loading recipe...</h2>{loadingMessage}</section>;
  }

  let messageElement = null;
  if (message) {
    messageElement = <div className="message error">{message}</div>;
  }

  let detailImageStyle;
  if (recipe.imageUrl) {
    detailImageStyle = {
      background: `linear-gradient(rgba(17,24,16,0.2), rgba(17,24,16,0.5)), url(${recipe.imageUrl}) center/cover`
    };
  }

  let sourceLink = null;
  if (recipe.externalUrl) {
    sourceLink = <a className="ghost-btn" href={recipe.externalUrl} target="_blank" rel="noreferrer">View source</a>;
  }

  return (
    <section className="detail-shell">
      {messageElement}
      <div className="detail-hero">
        <div className="detail-image" style={detailImageStyle} />
        <div className="card">
          <span className="eyebrow eyebrow-green">{recipe.category}</span>
          <h1>{recipe.title}</h1>
          <p>{recipe.description}</p>
          <div className="meta-row">
            <span>{recipe.cuisine}</span>
            <span>{recipe.cookTime} min</span>
            <span>{recipe.servings} servings</span>
          </div>
          <div className="hero-actions detail-actions">
            <Link className="primary-btn" to={`/recipes/${id}/edit`}>Edit recipe</Link>
            {sourceLink}
            <button
              className="ghost-btn danger"
              type="button"
              onClick={async () => {
                const confirmed = await confirmDelete('Delete this recipe?', 'This removes it from your recipe box.');
                if (!confirmed || !id) return;
                try {
                  await api(`/api/recipes/${id}`, { method: 'DELETE' });
                  navigate('/recipes');
                } catch (error) {
                  setMessage((error as Error).message);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ingredient) => {
              let ingredientText = ingredient.name;
              if (ingredient.amount) {
                ingredientText = `${ingredient.amount} ${ingredient.name}`;
              }
              return <li key={`${ingredient.name}-${ingredient.amount}`}>{ingredientText}</li>;
            })}
          </ul>
        </div>
        <div className="card">
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}
