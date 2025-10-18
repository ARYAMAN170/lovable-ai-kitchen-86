import { useEffect, useState, useCallback, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import RecipeGrid from '@/components/RecipeGrid';
import { Search, Bell, Utensils, Coffee, Sun, Moon, Clock, Users, Star, Heart, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { recipeAPI, Recipe, favoritesAPI } from '@/lib/apiClient';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const loadRecipes = useCallback(async (currentPage: number, isInitial = false) => {
    try {
      if (isInitial) {
        setRecipesLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const skip = currentPage * 8; // 8 recipes per page for 4-column grid
      const limit = 8;
      const fetchedRecipes = await recipeAPI.getRecipes(skip, limit);
      
      if (isInitial) {
        setRecipes(fetchedRecipes);
      } else {
        setRecipes(prev => [...prev, ...fetchedRecipes]);
      }
      
      // If we got fewer recipes than requested, we've reached the end
      setHasMore(fetchedRecipes.length === limit);
      
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setRecipesLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadFeaturedRecipe = useCallback(async () => {
    try {
      // Get favorites recipes directly (not just IDs)
      const favoriteRecipes = await favoritesAPI.getFavorites();
      console.log('Loaded favorite recipes:', favoriteRecipes);
      
      if (favoriteRecipes.length > 0) {
        // Pick a random favorite as featured
        const randomIndex = Math.floor(Math.random() * favoriteRecipes.length);
        setFeaturedRecipe(favoriteRecipes[randomIndex]);
        console.log('Set featured recipe from favorites:', favoriteRecipes[randomIndex]);
        return;
      }
      
      // Fallback: use first recipe from regular recipes if no favorites
      const fallbackRecipes = await recipeAPI.getRecipes(0, 1);
      if (fallbackRecipes.length > 0) {
        setFeaturedRecipe(fallbackRecipes[0]);
        console.log('Set featured recipe from fallback:', fallbackRecipes[0]);
      }
    } catch (error) {
      console.error('Failed to load featured recipe:', error);
    }
  }, []);

  useEffect(() => {
    loadRecipes(0, true);
    loadFeaturedRecipe();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadRecipes, loadFeaturedRecipe]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadRecipes(nextPage, false);
  }, [page, loadRecipes]);

  // Sentinel ref to trigger infinite scroll
  const sentinelRef = useIntersectionObserver(() => {
    if (!loadingMore && hasMore && !isSearching) {
      handleLoadMore();
    }
  }, { root: null, rootMargin: '300px', threshold: 0 });

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      const results = await recipeAPI.searchRecipes(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (query.length > 2) {
        handleSearch(query);
      } else if (query.length === 0) {
        clearSearch();
      }
    }, 300);
  }, [handleSearch]);

  const clearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const userName = user?.name || 'Chef';
  const greeting = 'Good morning';

  // Show server loading message when initially loading recipes
  if (recipesLoading && recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Starting up Stir...</h2>
          <div className="space-y-3">
            <p className="text-gray-600 text-lg">
              🚀 Waking up our servers...
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-orange-800 text-sm">
                <strong>Please wait ~50 seconds</strong> - Our free tier server is starting up. 
                This only happens on the first visit and makes everything faster afterward!
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Thank you for your patience ⏰
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
      {/* Enhanced Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-orange-200">
                <AvatarFallback className="bg-orange-500 text-white text-sm sm:text-base">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{greeting}</p>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">{userName}</h2>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-orange-100 transition-colors">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Good morning, {userName}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Warm up your stove and let's create something delicious together
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
            <Input
              placeholder="Search for recipes, ingredients, or cuisines..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                debouncedSearch(value);
              }}
              className="w-full pl-12 sm:pl-14 pr-10 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg rounded-2xl border-2 border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-orange-100 rounded-full transition-colors"
              >
                <span className="text-gray-500 text-lg sm:text-xl">×</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section - Featured Recipe */}
      {featuredRecipe && (
        <section className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex flex-col lg:flex-row">
              {/* Left Content */}
              <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 text-white">
                <div className="inline-block bg-white/20 text-xs sm:text-sm px-3 py-1 rounded-full mb-4">
                  ⭐ Featured from Favorites
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  {featuredRecipe.title}
                </h2>
                <p className="text-base sm:text-lg opacity-90 mb-6 leading-relaxed">
                  One of your favorite recipes - perfectly crafted and ready to cook again!
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm sm:text-base">25 min</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm sm:text-base">4 servings</span>
                  </span>
                  <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Easy
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/recipe/${featuredRecipe._id}`)}
                  className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 font-semibold px-6 sm:px-8 py-3 rounded-xl transition-colors text-center"
                >
                  View Recipe
                </button>
              </div>
              
              {/* Right Image */}
              <div className="lg:w-1/2">
                <img 
                  src={featuredRecipe.image?.url || '/placeholder.svg'} 
                  alt={featuredRecipe.title}
                  className="w-full h-64 lg:h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12 pb-20 sm:pb-24">
        {isSearching ? (
          /* Search Results Section */
          <section>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Search Results</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide">
                {searchResults.map((recipe, index) => (
                  <RecipeCard key={recipe._id} recipe={recipe} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
                <h4 className="font-semibold text-lg mb-2 text-gray-900">No recipes found</h4>
                <p className="text-gray-600 mb-4">
                  Try searching for different ingredients or recipe names
                </p>
                <button
                  onClick={clearSearch}
                  className="px-6 py-3 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                >
                  Browse All Recipes
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Carousel Sections */
          <>
            {/* Trending Carousel */}
            <section>
              <div className="mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">🔥 Trending on Stir</h3>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">What everyone's cooking this week</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide">
                {recipes.slice(0, 6).map((recipe, index) => (
                  <RecipeCard key={recipe._id} recipe={recipe} index={index} />
                ))}
              </div>
            </section>

            {/* Quick Meals Carousel */}
            <section>
              <div className="mb-4 sm:mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">⚡ Quick Weeknight Dinners</h3>
                  <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Ready in 30 minutes or less</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {recipes.slice(2, 8).map((recipe, index) => (
                  <RecipeCard key={`quick-${recipe._id}`} recipe={recipe} index={index} />
                ))}
              </div>
            </section>

            {/* Recently Added Carousel */}
            <section>
              <div className="mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">✨ Recently Added</h3>
                  <p className="text-gray-600">Fresh recipes from our community</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {recipes.slice(1, 7).map((recipe, index) => (
                  <RecipeCard key={`recent-${recipe._id}`} recipe={recipe} index={index} />
                ))}
              </div>
            </section>

            {/* Vegetarian Carousel */}
            <section>
              <div className="mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">🌱 Popular Vegetarian Options</h3>
                  <p className="text-gray-600">Plant-based favorites</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {recipes.slice(3, 9).map((recipe, index) => (
                  <RecipeCard key={`veg-${recipe._id}`} recipe={recipe} index={index} />
                ))}
              </div>
            </section>

            {/* Seasonal Carousel */}
            <section>
              <div className="mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">🍂 Autumn Favorites</h3>
                  <p className="text-gray-600">Warm, comforting seasonal dishes</p>
                </div>
              </div>
              
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {recipes.slice(0, 6).map((recipe, index) => (
                  <RecipeCard key={`seasonal-${recipe._id}`} recipe={recipe} index={index} />
                ))}
              </div>
            </section>

            {/* Infinite Scroll Section */}
            {recipes.length > 6 && (
              <section className="mt-8">
                <div className="mb-6 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">🍽️ More Delicious Recipes</h3>
                  <p className="text-gray-600">Scroll down to discover more amazing dishes</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                  {recipes.slice(6).map((recipe, index) => (
                    <RecipeCard key={`infinite-${recipe._id}`} recipe={recipe} index={index + 6} />
                  ))}
                </div>

                {/* Load More Button/Indicator */}
                {hasMore && (
                  <div className="flex justify-center mt-6 sm:mt-8">
                    {loadingMore ? (
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                        <span>Loading more recipes...</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const nextPage = page + 1;
                          setPage(nextPage);
                          loadRecipes(nextPage);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Load More Recipes
                      </button>
                    )}
                  </div>
                )}
                
                {!hasMore && recipes.length > 6 && (
                  <div className="text-center mt-6 sm:mt-8 text-gray-500">
                    <p>🎉 You've seen all our amazing recipes!</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef as any} className="h-2 w-full" />

      <BottomNav />
    </div>
  );
};

// Enhanced Recipe Card Component
const RecipeCard = ({ recipe, index }: { recipe: Recipe; index: number }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/recipe/${recipe._id}`)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image with overlay */}
      <div className="relative">
        <img 
          src={recipe.image?.url || '/placeholder.svg'}
          alt={recipe.title}
          className="w-full h-40 sm:h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs font-medium">4.8</span>
          </div>
        </div>
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Easy
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 sm:p-5">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {recipe.title}
        </h4>
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 hidden sm:block">
          Delicious and perfectly seasoned recipe that's perfect for any occasion.
        </p>
        
        {/* Meta info */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">25 min</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">4 servings</span>
            </span>
          </div>
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Home;
