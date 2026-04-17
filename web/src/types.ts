export type User = {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
};

export type Ingredient = {
  name: string;
  amount: string;
};

export type Recipe = {
  _id?: string;
  title: string;
  description: string;
  cuisine: string;
  category: string;
  dietaryTags: string[];
  cravingTags: string[];
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string;
  externalUrl?: string;
  isFavorite: boolean;
};

export type ExternalRecipe = Recipe & {
  externalId: string;
  source: 'spoonacular' | 'themealdb';
  externalUrl?: string;
};
