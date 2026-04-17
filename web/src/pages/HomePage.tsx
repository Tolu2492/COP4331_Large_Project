// Home page that switches between a marketing landing page and a signed-in recipe dashboard.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { api } from '../lib/api';
import type { Recipe } from '../types';

const collections = [
  {
    title: 'Weeknight dinners',
    description: 'Reliable recipes that feel worth making on a Tuesday night.',
    accent: 'orange'
  },
  {
    title: 'Pantry cooking',
    description: 'Flexible ideas built around staples, produce, and leftovers.',
    accent: 'green'
  },
  {
    title: 'Recipe box favorites',
    description: 'The meals you save once and keep coming back to.',
    accent: 'orange'
  }
];

type RecipeListResponse = {
  recipes: Recipe[];
};

function DashboardRecipeCard({ recipe }: { recipe: Recipe }) {
  let backgroundStyle = undefined;
  if (recipe.imageUrl) {
    backgroundStyle = {
      backgroundImage: `linear-gradient(rgba(17, 24, 16, 0.18), rgba(17, 24, 16, 0.62)), url(${recipe.imageUrl})`
    };
  }

  let badgeLabel = recipe.category;
  if (recipe.dietaryTags[0]) {
    badgeLabel = recipe.dietaryTags[0];
  }

  return (
    <article className="dashboard-recipe-card card">
      <div className="dashboard-recipe-image" style={backgroundStyle} aria-hidden="true">
        <span className="dashboard-recipe-badge">{badgeLabel}</span>
      </div>
      <div className="dashboard-recipe-copy">
        <div>
          <h3>{recipe.title}</h3>
          <p>{recipe.description}</p>
        </div>
        <div className="dashboard-recipe-meta">
          <span>{recipe.cookTime} min</span>
          <span>{recipe.cuisine}</span>
        </div>
        <div className="dashboard-recipe-actions">
          <Link className="text-link" to={`/recipes/${recipe._id || ''}`}>
            View recipe
          </Link>
        </div>
      </div>
    </article>
  );
}

function DashboardRecipeSection({
  title,
  description,
  recipes,
  emptyTitle,
  emptyBody,
  linkTo,
  linkLabel
}: {
  title: string;
  description: string;
  recipes: Recipe[];
  emptyTitle: string;
  emptyBody: string;
  linkTo: string;
  linkLabel: string;
}) {
  let content = null;

  if (recipes.length > 0) {
    content = (
      <div className="dashboard-card-grid">
        {recipes.map((recipe) => (
          <DashboardRecipeCard key={recipe._id || recipe.title} recipe={recipe} />
        ))}
      </div>
    );
  } else {
    content = (
      <div className="dashboard-empty card">
        <h3>{emptyTitle}</h3>
        <p>{emptyBody}</p>
        <Link className="text-link" to={linkTo}>{linkLabel}</Link>
      </div>
    );
  }

  return (
    <section className="card dashboard-section" aria-label={title}>
      <div className="section-head section-head-tight">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link className="text-link" to={linkTo}>{linkLabel}</Link>
      </div>
      {content}
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!user) {
      setFavoriteRecipes([]);
      setRecentRecipes([]);
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      try {
        const [favoritesData, recipesData] = await Promise.all([
          api<RecipeListResponse>('/api/recipes?favorites=true'),
          api<RecipeListResponse>('/api/recipes')
        ]);

        if (cancelled) {
          return;
        }

        setFavoriteRecipes(favoritesData.recipes.slice(0, 3));
        setRecentRecipes(recipesData.recipes.slice(0, 3));
      } catch (_error) {
        if (cancelled) {
          return;
        }

        setFavoriteRecipes([]);
        setRecentRecipes([]);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  let heroActions = null;
  if (user) {
    heroActions = (
      <>
        <Link className="primary-btn" to="/favorites">Go to favorites</Link>
        <Link className="ghost-btn ghost-btn-green" to="/pantry">View pantry</Link>
      </>
    );
  } else {
    heroActions = (
      <>
        <Link className="primary-btn" to="/register">Create an account</Link>
        <Link className="ghost-btn ghost-btn-green" to="/login">Sign in</Link>
      </>
    );
  }

  let homeBody = null;

  if (user) {
    homeBody = (
      <>
        <section className="hero-grid hero-real garnish-hero home-hero-simple">
          <div className="hero-copy hero-copy-panel">
            <span className="eyebrow eyebrow-orange">Welcome back</span>
            <h1>What are you cooking today?</h1>
            <p>
              Jump back into favorites, keep your recipe box organized, and turn what you already have into dinner.
            </p>
            <div className="hero-actions">{heroActions}</div>
          </div>

          <aside className="card home-hero-aside home-hero-aside-compact" aria-label="Quick actions">
            <div className="home-hero-stat-stack">
              <div className="home-hero-stat">
                <span className="section-kicker">Favorites</span>
                <h3>Keep your best meals close.</h3>
                <p>Save the recipes you return to and keep them one click away.</p>
              </div>
              <div className="home-hero-stat">
                <span className="section-kicker">Pantry</span>
                <h3>Cook from what you already have.</h3>
                <p>Use pantry staples to guide discovery without starting from scratch.</p>
              </div>
            </div>
          </aside>
        </section>

        <DashboardRecipeSection
          title="Favorites"
          description="The recipes you have marked to keep close."
          recipes={favoriteRecipes}
          emptyTitle="No favorites yet"
          emptyBody="Save a few recipes you want to keep on hand and they will show up here."
          linkTo="/favorites"
          linkLabel="Open favorites"
        />

        <DashboardRecipeSection
          title="My recipes"
          description="Your saved and imported recipes, ready to revisit or edit."
          recipes={recentRecipes}
          emptyTitle="Your recipe box is empty"
          emptyBody="Bring in a discovery you like or add one of your own recipes to get started."
          linkTo="/recipes"
          linkLabel="Open recipes"
        />
      </>
    );
  } else {
    homeBody = (
      <>
        <section className="hero-grid hero-real garnish-hero home-hero-simple">
          <div className="hero-copy hero-copy-panel">
            <span className="eyebrow eyebrow-orange">Everyday recipe discovery</span>
            <h1>Find something good to cook.</h1>
            <p>
              Garnish helps you discover recipes, save the ones worth keeping, and turn pantry staples into real meal ideas.
            </p>
            <div className="hero-actions">{heroActions}</div>
          </div>

          <aside className="card home-hero-aside" aria-label="Garnish overview">
            <div className="home-hero-stat-stack">
              <div className="home-hero-stat">
                <span className="section-kicker">Discover</span>
                <h3>Find recipes with less friction.</h3>
                <p>Search by craving, ingredient, cuisine, or diet and get to something useful faster.</p>
              </div>
              <div className="home-hero-stat">
                <span className="section-kicker">Save</span>
                <h3>Make the good ones yours.</h3>
                <p>Keep favorites, refine imported recipes, and build a recipe box around what you actually cook.</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="card collection-band" aria-labelledby="featured-collections-title">
          <div className="section-head section-head-tight">
            <div>
              <h2 id="featured-collections-title">Browse by the kind of meal you need</h2>
              <p>Built for regular cooking, not endless scrolling.</p>
            </div>
            <Link className="text-link" to="/register">Start with Garnish</Link>
          </div>
          <div className="card-grid three">
            {collections.map((collection) => (
              <article key={collection.title} className={`collection-card ${collection.accent}`}>
                <div className="collection-flag">Collection</div>
                <h3>{collection.title}</h3>
                <p>{collection.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-strip card" aria-labelledby="cta-title">
          <div>
            <span className="eyebrow eyebrow-green">Ready to cook with more direction?</span>
            <h2 id="cta-title">Keep your next meal close.</h2>
            <p>Discover recipes, save the ones that stick, and keep your pantry in the loop.</p>
          </div>
          <div className="hero-actions">
            <Link className="primary-btn" to="/register">Create an account</Link>
            <Link className="ghost-btn ghost-btn-green" to="/login">Sign in</Link>
          </div>
        </section>
      </>
    );
  }

  return <div className="stack home-stack">{homeBody}</div>;
}
