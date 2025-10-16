import api from '@/lib/api';

// API Response interfaces matching your backend format
export interface RecipeImage {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export interface Recipe {
  _id: string;
  title: string;
  ingredients_cleaned: string[];
  instructions: string;
  image: RecipeImage;
}

// AI Generated Recipe interfaces
export interface GeneratedIngredient {
  item: string;
  quantity: string;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  servings: string;
  prep_time: string;
  cook_time: string;
  ingredients: GeneratedIngredient[];
  instructions: string[];
}

// Legacy interfaces for compatibility with existing components
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Legacy recipe format for components that haven't been updated yet
export interface LegacyRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  cook_time: string;
  difficulty: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servings: number;
  user_id: string;
  created_at: string;
  is_favorite?: boolean;
}

export interface CreateRecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  cook_time: string;
  difficulty: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  servings: number;
}

// Mock user for development
const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  created_at: new Date().toISOString(),
  is_active: true
};

// Mock data for legacy features not yet using real API
let mockFavorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');
let savedGeneratedRecipes: Recipe[] = JSON.parse(localStorage.getItem('generatedRecipes') || '[]');

// Utility function to convert API recipe to legacy format
const convertToLegacyRecipe = (recipe: Recipe): LegacyRecipe => ({
  id: recipe._id,
  title: recipe.title,
  description: recipe.instructions.substring(0, 100) + '...', // Use first part of instructions as description
  ingredients: recipe.ingredients_cleaned,
  instructions: recipe.instructions.split('\n').filter(step => step.trim() !== ''), // Split instructions into steps
  prep_time: '15 min', // Default values since not in API
  cook_time: '20 min',
  difficulty: 'Medium',
  calories: '350',
  protein: '20g',
  carbs: '30g',
  fat: '15g',
  servings: 4,
  user_id: 'mock-user-id',
  created_at: new Date().toISOString(),
  is_favorite: mockFavorites.includes(recipe._id)
});

// Auth API (Mock - since no auth implemented yet)
export const authAPI = {
  async login(data: LoginData) {
    return {
      access_token: "mock-token",
      token_type: "bearer",
      user: mockUser
    };
  },

  async register(data: RegisterData) {
    return mockUser;
  },

  async getCurrentUser(): Promise<User> {
    return mockUser;
  },
};

// Recipe API - Real API calls to your backend
export const recipeAPI = {
  async createRecipe(data: CreateRecipeData): Promise<LegacyRecipe> {
    // This would call your recipe creation endpoint
    const response = await api.post('/api/v1/recipes/', data);
    return convertToLegacyRecipe(response.data);
  },

  async generateRecipe(ingredients: string): Promise<any> {
    try {
      // Parse ingredients string into array
      const ingredientArray = ingredients
        .trim()
        .split(/[,\n]+/) // Split by comma or newline
        .map(ingredient => ingredient.trim()) // Trim whitespace
        .filter(ingredient => ingredient.length > 0); // Remove empty strings
      
      if (ingredientArray.length === 0) {
        throw new Error('Please provide at least one ingredient');
      }

      const response = await api.post('/api/v1/generate/generate-recipe/', {
        ingredients: ingredientArray
      });
      return response.data;
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  },

  // Convert generated recipe to Recipe format for favorites
  convertGeneratedToRecipe(generatedRecipe: GeneratedRecipe, imageUrl?: string): Recipe {
    return {
      _id: `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID for generated recipe
      title: generatedRecipe.title,
      ingredients_cleaned: generatedRecipe.ingredients.map(ing => `${ing.quantity} ${ing.item}`),
      instructions: generatedRecipe.instructions.join('\n\n'),
      image: {
        url: imageUrl || '/placeholder.svg',
        public_id: imageUrl ? 'generated' : 'placeholder',
        width: 274,
        height: 169,
        format: imageUrl ? 'jpg' : 'svg'
      }
    };
  },

  // Extract ingredients from image
  async extractIngredientsFromImage(file: File): Promise<{ ingredients: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/v1/image/extract-ingredients/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting ingredients from image:', error);
      throw error;
    }
  },

  // Generate image for recipe
  async generateRecipeImage(prompt: string): Promise<{ url: string; public_id: string }> {
    try {
      console.log('API Client: Sending image generation request with prompt:', prompt);
      
      const response = await api.post('/api/v1/image/generate-image/', {
        prompt: prompt
      });
      
      console.log('API Client: Full response:', response);
      console.log('API Client: Response data:', response.data);
      console.log('API Client: Response status:', response.status);
      
      return response.data;
    } catch (error) {
      console.error('Error generating recipe image:', error);
      throw error;
    }
  },

  async getRecipes(skip = 0, limit = 100): Promise<Recipe[]> {
    try {
      const response = await api.get(`/api/v1/recipes/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },

  async searchRecipes(query: string, skip = 0, limit = 20): Promise<Recipe[]> {
    try {
      if (!query.trim()) {
        return [];
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      // Search API recipes
      const allRecipes = await this.getRecipes(0, 200);
      const filteredApiRecipes = allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients_cleaned.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        ) ||
        recipe.instructions.toLowerCase().includes(searchTerm)
      );
      
      // Search generated recipes
      const filteredGeneratedRecipes = savedGeneratedRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.ingredients_cleaned.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        ) ||
        recipe.instructions.toLowerCase().includes(searchTerm)
      );
      
      // Combine and sort results (generated recipes first for recency)
      const allResults = [...filteredGeneratedRecipes, ...filteredApiRecipes];
      
      // Apply pagination to search results
      return allResults.slice(skip, skip + limit);
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  },

  async getLegacyRecipes(): Promise<LegacyRecipe[]> {
    try {
      const recipes = await this.getRecipes();
      return recipes.map(convertToLegacyRecipe);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },

  async getRecipe(id: string): Promise<Recipe> {
    // Check if it's a generated recipe first
    if (id.startsWith('generated-')) {
      const generatedRecipe = await favoritesAPI.getGeneratedRecipe(id);
      if (generatedRecipe) {
        return generatedRecipe;
      }
    }
    
    // Otherwise fetch from API
    const response = await api.get(`/api/v1/recipes/${id}`);
    return response.data;
  },

  async getLegacyRecipe(id: string): Promise<LegacyRecipe> {
    const recipe = await this.getRecipe(id);
    return convertToLegacyRecipe(recipe);
  },

  async deleteRecipe(id: string) {
    const response = await api.delete(`/api/v1/recipes/${id}`);
    return response.data;
  },
};

// Favorites API (Mock for now)
export const favoritesAPI = {
  async addFavorite(recipeId: string) {
    if (!mockFavorites.includes(recipeId)) {
      mockFavorites.push(recipeId);
      localStorage.setItem('favorites', JSON.stringify(mockFavorites));
    }
    return { message: "Added to favorites" };
  },

  async removeFavorite(recipeId: string) {
    mockFavorites = mockFavorites.filter(id => id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(mockFavorites));
    return { message: "Removed from favorites" };
  },

  async getFavorites(): Promise<Recipe[]> {
    try {
      if (mockFavorites.length === 0) {
        return [];
      }
      
      // Get API recipes
      const allRecipes = await recipeAPI.getRecipes(0, 100);
      const favoriteApiRecipes = allRecipes.filter(recipe => mockFavorites.includes(recipe._id));
      
      // Get generated recipes that are favorited
      const favoriteGeneratedRecipes = savedGeneratedRecipes.filter(recipe => mockFavorites.includes(recipe._id));
      
      // Combine both types
      return [...favoriteApiRecipes, ...favoriteGeneratedRecipes];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      // Still return generated favorites even if API fails
      return savedGeneratedRecipes.filter(recipe => mockFavorites.includes(recipe._id));
    }
  },

  async saveGeneratedRecipe(recipe: Recipe): Promise<void> {
    // Check if recipe already exists
    const existingIndex = savedGeneratedRecipes.findIndex(r => r._id === recipe._id);
    
    if (existingIndex >= 0) {
      // Update existing recipe
      savedGeneratedRecipes[existingIndex] = recipe;
    } else {
      // Add new recipe
      savedGeneratedRecipes.push(recipe);
    }
    
    localStorage.setItem('generatedRecipes', JSON.stringify(savedGeneratedRecipes));
  },

  async getGeneratedRecipe(id: string): Promise<Recipe | null> {
    const recipe = savedGeneratedRecipes.find(r => r._id === id);
    return recipe || null;
  },

  async isFavorite(recipeId: string): Promise<boolean> {
    return mockFavorites.includes(recipeId);
  },
};