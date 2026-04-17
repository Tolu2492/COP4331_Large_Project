// Provider adapter that searches external recipe sources and normalizes them into Garnish shape.
import PantryItem from '../models/PantryItem.js';

const spoonBase = 'https://api.spoonacular.com';
const mealBase = 'https://www.themealdb.com/api/json/v1/1';

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleCase(value = '') {
  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

// Break TheMealDB instruction text into a list of readable steps.
function parseThemealInstructions(text = '') {
  return String(text)
    .split(/\r?\n|\.(?=\s+[A-Z])/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0);
}

function normalizeSpoonacularRecipe(recipe) {
  let category = 'Recipe';
  if (recipe.dishTypes?.[0]) {
    category = titleCase(recipe.dishTypes[0]);
  }

  const dietaryTags = [];
  if (recipe.vegan) {
    dietaryTags.push('vegan');
  }
  if (recipe.vegetarian) {
    dietaryTags.push('vegetarian');
  }
  if (recipe.glutenFree) {
    dietaryTags.push('gluten-free');
  }
  if (recipe.dairyFree) {
    dietaryTags.push('dairy-free');
  }

  return {
    externalId: String(recipe.id),
    source: 'spoonacular',
    title: recipe.title,
    description: stripHtml(recipe.summary || 'Imported from Spoonacular.'),
    cuisine: recipe.cuisines?.[0] || 'General',
    category,
    dietaryTags,
    cravingTags: (recipe.occasions || []).slice(0, 3),
    cookTime: recipe.readyInMinutes || 30,
    servings: recipe.servings || 2,
    ingredients: (recipe.extendedIngredients || []).map((item) => ({
      name: item.nameClean || item.name || 'Ingredient',
      amount: item.original || item.amount?.toString() || ''
    })),
    instructions: (recipe.analyzedInstructions?.[0]?.steps || []).map((step) => step.step).filter(Boolean),
    imageUrl: recipe.image || '',
    externalUrl: recipe.sourceUrl || recipe.spoonacularSourceUrl || ''
  };
}

function normalizeMealDbRecipe(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && String(name).trim()) {
      ingredients.push({ name: String(name).trim(), amount: String(measure || '').trim() });
    }
  }

  const dietaryTags = [];
  const category = meal.strCategory || 'Recipe';
  if (/vegetarian|vegan/i.test(category) || /vegetarian|vegan/i.test(meal.strMeal || '')) {
    let dietaryTag = 'vegetarian';
    if (/vegan/i.test(category + meal.strMeal)) {
      dietaryTag = 'vegan';
    }
    dietaryTags.push(dietaryTag);
  }

  return {
    externalId: String(meal.idMeal),
    source: 'themealdb',
    title: meal.strMeal,
    description: stripHtml(meal.strInstructions || 'Imported from TheMealDB.').slice(0, 220),
    cuisine: meal.strArea || 'General',
    category,
    dietaryTags,
    cravingTags: [meal.strCategory, meal.strArea].filter(Boolean).map((value) => String(value).toLowerCase()).slice(0, 3),
    cookTime: 30,
    servings: 2,
    ingredients,
    instructions: parseThemealInstructions(meal.strInstructions),
    imageUrl: meal.strMealThumb || '',
    externalUrl: meal.strSource || meal.strYoutube || ''
  };
}

function buildCravingProfile(query = '') {
  const text = String(query).toLowerCase();

  let maxReadyTime;
  if (/quick|fast|under 30|weeknight/.test(text)) {
    maxReadyTime = 30;
  }

  const includeIngredients = [];
  if (/garlic/.test(text)) {
    includeIngredients.push('garlic');
  }
  if (/spicy|chili|heat/.test(text)) {
    includeIngredients.push('chili');
  }
  if (/creamy/.test(text)) {
    includeIngredients.push('cream');
  }
  if (/protein/.test(text)) {
    includeIngredients.push('chicken');
  }

  return {
    maxReadyTime,
    includeIngredients
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`External API request failed: ${response.status} ${body}`);
  }
  return response.json();
}

async function getPantryNames(userId) {
  const items = await PantryItem.find({ userId, inStock: true }).sort({ updatedAt: -1 }).limit(8);
  return items.map((item) => item.name.trim()).filter(Boolean);
}

// Search external providers while still keeping pantry-driven suggestions on the server.
export async function searchExternalRecipes({ userId, query = '', diet = '', cuisine = '', usePantry = false }) {
  let pantryNames = [];
  if (usePantry) {
    pantryNames = await getPantryNames(userId);
  }

  const profile = buildCravingProfile(query);
  const ingredients = [...new Set([...pantryNames, ...profile.includeIngredients])];

  if (process.env.SPOONACULAR_API_KEY) {
    try {
      const params = new URLSearchParams({
        apiKey: process.env.SPOONACULAR_API_KEY,
        number: '12',
        addRecipeInformation: 'true',
        fillIngredients: 'true',
        query: query || pantryNames.join(' ') || cuisine || diet || 'dinner'
      });
      if (diet) params.set('diet', diet);
      if (cuisine) params.set('cuisine', cuisine);
      if (ingredients.length) params.set('includeIngredients', ingredients.slice(0, 6).join(','));
      if (profile.maxReadyTime) params.set('maxReadyTime', String(profile.maxReadyTime));

      const data = await fetchJson(`${spoonBase}/recipes/complexSearch?${params.toString()}`);
      const results = (data.results || []).map(normalizeSpoonacularRecipe);
      if (results.length) {
        return { sourceUsed: 'spoonacular', pantryUsed: pantryNames, results };
      }
    } catch (error) {
      console.error('Spoonacular search failed, falling back to TheMealDB:', error.message);
    }
  }

  const fallbackQuery = query || pantryNames[0] || cuisine || 'chicken';
  const mealSearch = await fetchJson(`${mealBase}/search.php?s=${encodeURIComponent(fallbackQuery)}`);
  let meals = mealSearch.meals || [];

  if (!meals.length && pantryNames[0]) {
    const ingredientResults = await fetchJson(`${mealBase}/filter.php?i=${encodeURIComponent(pantryNames[0])}`);
    const candidates = (ingredientResults.meals || []).slice(0, 8);
    const details = await Promise.all(candidates.map((item) => fetchJson(`${mealBase}/lookup.php?i=${encodeURIComponent(item.idMeal)}`)));
    meals = details.flatMap((entry) => entry.meals || []);
  }

  const filteredMeals = meals
    .map(normalizeMealDbRecipe)
    .filter((recipe) => {
      if (cuisine && !String(recipe.cuisine || '').toLowerCase().includes(String(cuisine).toLowerCase())) {
        return false;
      }
      if (diet === 'vegan') {
        return recipe.dietaryTags.includes('vegan');
      }
      if (diet === 'vegetarian') {
        return recipe.dietaryTags.includes('vegan') || recipe.dietaryTags.includes('vegetarian');
      }
      return true;
    });

  return {
    sourceUsed: 'themealdb',
    pantryUsed: pantryNames,
    results: filteredMeals.slice(0, 12)
  };
}

export async function getExternalRecipeBySource(source, externalId) {
  if (source === 'spoonacular') {
    if (!process.env.SPOONACULAR_API_KEY) {
      throw new Error('Spoonacular API key is missing.');
    }
    const data = await fetchJson(`${spoonBase}/recipes/${encodeURIComponent(externalId)}/information?apiKey=${encodeURIComponent(process.env.SPOONACULAR_API_KEY)}`);
    return normalizeSpoonacularRecipe(data);
  }

  const data = await fetchJson(`${mealBase}/lookup.php?i=${encodeURIComponent(externalId)}`);
  const meal = data.meals?.[0];
  if (!meal) {
    throw new Error('External recipe not found.');
  }
  return normalizeMealDbRecipe(meal);
}
