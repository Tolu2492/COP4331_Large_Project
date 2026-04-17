// Editor page for creating new recipes or updating existing ones with preloaded values.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { api } from '../lib/api';
import type { Recipe } from '../types';

const initialRecipe: Recipe = {
  title: '',
  description: '',
  cuisine: 'General',
  category: 'Dinner',
  dietaryTags: [],
  cravingTags: [],
  cookTime: 30,
  servings: 2,
  ingredients: [],
  instructions: [],
  imageUrl: '',
  isFavorite: false
};

export default function RecipeEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    api<{ recipe: Recipe }>(`/api/recipes/${id}`)
      .then((data) => setRecipe(data.recipe))
      .catch((error) => setMessage((error as Error).message));
  }, [id]);

  let heading = 'Create a recipe';
  if (id) {
    heading = 'Edit recipe';
  }

  let messageElement = null;
  if (message) {
    messageElement = <div className="message success">{message}</div>;
  }

  return (
    <section className="stack">
      <div className="section-head">
        <div>
          <h1>{heading}</h1>
          <p>Capture your own recipe or refine something you imported into Garnish.</p>
        </div>
      </div>
      {messageElement}
      <RecipeForm
        initialRecipe={recipe}
        onSubmit={async (nextRecipe) => {
          try {
            if (id) {
              await api(`/api/recipes/${id}`, { method: 'PUT', body: JSON.stringify(nextRecipe) });
            } else {
              await api(`/api/recipes`, { method: 'POST', body: JSON.stringify(nextRecipe) });
            }
            navigate('/recipes');
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      />
    </section>
  );
}
