import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import RecipeGrid from '@/components/RecipeGrid';
import { Heart } from 'lucide-react';
import { favoritesAPI, Recipe } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteRecipes = await favoritesAPI.getFavorites();
      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error('Failed to load favorite recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorite recipes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to recipe detail
    try {
      await favoritesAPI.removeFavorite(recipeId);
      setFavorites(favorites.filter(recipe => recipe._id !== recipeId));
      toast({
        title: 'Removed from favorites',
        description: 'Recipe has been removed from your favorites'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 bg-gradient-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Favorite Recipes</h1>
            <p className="text-muted-foreground">Your saved culinary inspirations</p>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-6 h-6 fill-current" />
            <span className="font-semibold">{favorites.length}</span>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg h-36"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {favorites.map((recipe, index) => (
              <div
                key={recipe._id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700 relative"
                onClick={() => navigate(`/recipe/${recipe._id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center rounded-t-lg h-36">
                  <img 
                    src={recipe.image?.url || '/placeholder.svg'}
                    alt={recipe.title}
                    className="h-full object-cover"
                    style={{ width: '274px', maxWidth: '274px' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-6 h-6 text-muted-foreground hidden absolute inset-0 m-auto">🍽️</div>
                  
                  {/* Remove favorite button */}
                  <button
                    onClick={(e) => removeFavorite(recipe._id, e)}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                    title="Remove from favorites"
                  >
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </button>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      ⏱️ Quick
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      {recipe.ingredients_cleaned.length} items
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start exploring recipes and tap the heart icon to save your favorites here.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Explore Recipes
              </button>
              <button
                onClick={() => navigate('/generate')}
                className="px-6 py-3 bg-card text-foreground rounded-lg hover:bg-muted transition-colors font-medium border"
              >
                Generate Recipe
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
