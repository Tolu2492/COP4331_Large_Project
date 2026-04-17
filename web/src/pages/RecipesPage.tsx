// Main recipe workspace for discovery, saved recipes, favorites, and search filters.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import type { ExternalRecipe, Recipe } from '../types';

type DiscoverResponse = {
  results: ExternalRecipe[];
};

type Filters = {
  query: string;
  diet: string;
  cuisine: string;
};

const fallbackRecipes: Recipe[] = [
  {
    _id: '1',
    title: 'Spicy Vegan Ramen',
    description: 'A quick umami-rich ramen with chili crisp, mushrooms, and soft greens for late-night cravings.',
    cuisine: 'Japanese',
    category: 'Dinner',
    dietaryTags: ['vegan'],
    cravingTags: ['spicy', 'comfort'],
    cookTime: 25,
    servings: 2,
    ingredients: [],
    instructions: [],
    imageUrl: '',
    isFavorite: true
  }
];

const initialFilters: Filters = {
  query: '',
  diet: '',
  cuisine: ''
};

export default function RecipesPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  let initialMode: 'saved' | 'discover' = 'discover';
  if (favoritesOnly) {
    initialMode = 'saved';
  }
  const [mode, setMode] = useState<'saved' | 'discover'>(initialMode);
  const [recipes, setRecipes] = useState<Recipe[]>(fallbackRecipes);
  const [externalRecipes, setExternalRecipes] = useState<ExternalRecipe[]>([]);
  const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);
  const [savedFilters, setSavedFilters] = useState<Filters>(initialFilters);
  const [discoverFilters, setDiscoverFilters] = useState<Filters>(initialFilters);
  const [usePantry, setUsePantry] = useState(true);
  const [importedRecipeIds, setImportedRecipeIds] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (favoritesOnly) return 'Your saved favorites';
    if (mode === 'discover') {
      return 'Discover recipes';
    }
    return 'My recipes';
  }, [favoritesOnly, mode]);

  useEffect(() => {
    if (favoritesOnly) {
      setMode('saved');
    }
  }, [favoritesOnly]);

  useEffect(() => {
    setLoading(true);
    api<{ recipes: Recipe[] }>(`/api/recipes?query=${encodeURIComponent(savedFilters.query)}&diet=${encodeURIComponent(savedFilters.diet)}&cuisine=${encodeURIComponent(savedFilters.cuisine)}&favorites=${favoritesOnly}`)
      .then((data) => setRecipes(data.recipes))
      .catch(() => setRecipes(fallbackRecipes.filter((recipe) => !favoritesOnly || recipe.isFavorite)))
      .finally(() => setLoading(false));
  }, [savedFilters, favoritesOnly]);

  async function runDiscoverSearch() {
    setLoading(true);
    setMessage('');
    setDiscoverFilters(draftFilters);
    try {
      const data = await api<DiscoverResponse>(`/api/recipes/discover?query=${encodeURIComponent(draftFilters.query)}&diet=${encodeURIComponent(draftFilters.diet)}&cuisine=${encodeURIComponent(draftFilters.cuisine)}&usePantry=${usePantry}`);
      setExternalRecipes(data.results);
      if (!data.results.length) {
        setMessage('No recipes matched yet. Try a broader search or turn pantry mode off.');
      }
    } catch (error) {
      setMessage((error as Error).message);
      setExternalRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveExternalRecipe(recipe: ExternalRecipe) {
    const key = `${recipe.source}:${recipe.externalId}`;
    if (importedRecipeIds[key]) return;

    try {
      const data = await api<{ recipe: Recipe }>(`/api/recipes/import`, {
        method: 'POST',
        body: JSON.stringify({ source: recipe.source, externalId: recipe.externalId })
      });
      setRecipes((current) => [data.recipe, ...current]);
      setImportedRecipeIds((current) => ({ ...current, [key]: data.recipe._id || '' }));
      setMessage(`${recipe.title} saved to your recipes.`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function toggleFavorite(recipe: Recipe) {
    try {
      const data = await api<{ recipe: Recipe }>(`/api/recipes/${recipe._id}/favorite`, { method: 'PATCH' });
      setRecipes((current) => current.map((item) => {
        if (item._id === recipe._id) {
          return data.recipe;
        }
        return item;
      }));
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  function handleFilterChange(field: keyof Filters, value: string) {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'discover' && !favoritesOnly) {
      runDiscoverSearch();
      return;
    }
    setSavedFilters(draftFilters);
  }

  let activeSummary = 'Keep your own recipes, imports, and favorites in one place.';
  if (mode === 'discover') {
    activeSummary = 'Search for a dish, ingredient, cuisine, or diet and save what looks worth making.';
  }

  let discoverButtonClassName = 'mode-pill';
  if (mode === 'discover') {
    discoverButtonClassName = 'mode-pill active';
  }

  let savedButtonClassName = 'mode-pill';
  if (mode === 'saved') {
    savedButtonClassName = 'mode-pill active';
  }

  let searchButtonLabel = 'Apply filters';
  if (mode === 'discover' && !favoritesOnly) {
    searchButtonLabel = 'Search';
  }

  let messageElement = null;
  if (message) {
    messageElement = <div className="message success">{message}</div>;
  }

  let pantryToggle = null;
  if (mode === 'discover' && !favoritesOnly) {
    pantryToggle = (
      <label className="pantry-toggle search-toggle">
        <input type="checkbox" checked={usePantry} onChange={(event) => setUsePantry(event.target.checked)} />
        Use pantry
      </label>
    );
  }

  let discoverHeadingDescription = 'Start with something you want to cook.';
  if (discoverFilters.query || discoverFilters.diet || discoverFilters.cuisine) {
    discoverHeadingDescription = 'A curated set of recipes based on your search.';
  }

  let discoverSection = null;
  if (mode === 'discover' && !favoritesOnly) {
    let emptyState = null;
    if (!externalRecipes.length && !loading) {
      emptyState = (
        <div className="empty-card card">
          <h3>No recipes yet</h3>
          <p>Search for a dish, ingredient, cuisine, or diet to start.</p>
        </div>
      );
    }

    discoverSection = (
      <>
        <div className="section-head section-head-tight">
          <div>
            <h2>Discover</h2>
            <p>{discoverHeadingDescription}</p>
          </div>
        </div>
        <div className="card-grid recipe-grid recipe-grid-polished">
          {externalRecipes.map((recipe) => (
            <RecipeCard
              key={`${recipe.source}-${recipe.externalId}`}
              recipe={recipe}
              onSaveExternal={saveExternalRecipe}
              importedRecipeId={importedRecipeIds[`${recipe.source}:${recipe.externalId}`]}
            />
          ))}
        </div>
        {emptyState}
      </>
    );
  }

  let savedSection = null;
  if (!discoverSection) {
    savedSection = (
      <div className="card-grid recipe-grid recipe-grid-polished">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id || recipe.title} recipe={recipe} onToggleFavorite={toggleFavorite} />
        ))}
      </div>
    );
  }

  return (
    <section className="stack">
      <div className="section-head recipes-head">
        <div>
          <h1>{title}</h1>
          <p>{activeSummary}</p>
        </div>
        <div className="mode-switch" aria-label="Recipe mode switcher">
          {!favoritesOnly && (
            <button type="button" className={discoverButtonClassName} onClick={() => setMode('discover')}>
              Discover
            </button>
          )}
          <button type="button" className={savedButtonClassName} onClick={() => setMode('saved')}>
            My recipes
          </button>
        </div>
      </div>

      <form className="search-shell card" role="search" aria-label="Recipe search" onSubmit={handleSearchSubmit}>
        <div className="search-shell-main">
          <input
            className="search-input-lg"
            placeholder="Search recipes, ingredients, cuisines, or cravings"
            value={draftFilters.query}
            onChange={(event) => handleFilterChange('query', event.target.value)}
            aria-label="Search recipes"
          />
          <div className="search-filter-row">
            <select value={draftFilters.diet} onChange={(event) => handleFilterChange('diet', event.target.value)} aria-label="Filter by diet">
              <option value="">All diets</option>
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="kosher">Kosher</option>
              <option value="gluten free">Gluten free</option>
            </select>
            <input
              placeholder="Cuisine or region"
              value={draftFilters.cuisine}
              onChange={(event) => handleFilterChange('cuisine', event.target.value)}
              aria-label="Cuisine filter"
            />
            {pantryToggle}
          </div>
        </div>
        <div className="search-shell-actions">
          <button className="primary-btn" type="submit">{searchButtonLabel}</button>
        </div>
      </form>

      {messageElement}
      {discoverSection}
      {savedSection}
    </section>
  );
}
