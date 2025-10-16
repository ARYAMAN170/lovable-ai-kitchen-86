import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Clock, Users, ChefHat, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { recipeAPI, favoritesAPI, Recipe } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [servings, setServings] = useState(4);
  const [originalServings] = useState(4); // Store original serving size
  const [isFavorite, setIsFavorite] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
      checkFavoriteStatus(id);
    }
  }, [id]);

  // Initialize ingredient checkboxes when recipe loads
  useEffect(() => {
    if (recipe?.ingredients_cleaned) {
      setCheckedIngredients(new Array(recipe.ingredients_cleaned.length).fill(false));
    }
  }, [recipe?.ingredients_cleaned]);

  const checkFavoriteStatus = async (recipeId: string) => {
    try {
      const favorite = await favoritesAPI.isFavorite(recipeId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const fetchRecipe = async (recipeId: string) => {
    try {
      const data = await recipeAPI.getRecipe(recipeId);
      setRecipe(data);
      setServings(4); // Default servings since not in API
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recipe',
        variant: 'destructive'
      });
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  // Scale ingredients based on serving size
  const scaleIngredient = (ingredient: string) => {
    const multiplier = servings / originalServings;
    
    // Regular expression to find numbers (including decimals and fractions)
    const numberRegex = /(\d+(?:\.\d+)?(?:\/\d+)?)/g;
    
    return ingredient.replace(numberRegex, (match) => {
      // Handle fractions
      if (match.includes('/')) {
        const [numerator, denominator] = match.split('/').map(Number);
        const decimal = numerator / denominator;
        const scaled = decimal * multiplier;
        
        // Convert back to fraction if it makes sense
        if (scaled < 1) {
          const commonFractions = {
            0.25: '1/4', 0.33: '1/3', 0.5: '1/2', 0.67: '2/3', 0.75: '3/4'
          };
          const closest = Object.entries(commonFractions).find(([decimal]) => 
            Math.abs(parseFloat(decimal) - scaled) < 0.05
          );
          if (closest) return closest[1];
        }
        
        return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
      }
      
      // Handle regular numbers
      const num = parseFloat(match);
      const scaled = num * multiplier;
      return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(1);
    });
  };

  // Process instructions into steps
  const getInstructionSteps = (instructions: string) => {
    // Split by common step indicators
    const steps = instructions.split(/(?:\d+\.|\n\n|\. )/g)
      .filter(step => step.trim().length > 10) // Filter out very short fragments
      .map(step => step.trim())
      .filter(step => step.length > 0);
    
    // If no clear steps found, split by sentences
    if (steps.length <= 1) {
      return instructions.split('. ')
        .filter(step => step.trim().length > 10)
        .map(step => step.trim() + (step.endsWith('.') ? '' : '.'));
    }
    
    return steps.map(step => step.endsWith('.') ? step : step + '.');
  };

  const toggleFavorite = async () => {
    if (!recipe) return;
    
    try {
      if (isFavorite) {
        await favoritesAPI.removeFavorite(recipe._id);
        toast({
          title: 'Removed',
          description: 'Recipe removed from favorites'
        });
      } else {
        await favoritesAPI.addFavorite(recipe._id);
        toast({
          title: 'Added',
          description: 'Recipe added to favorites'
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      });
    }
  };

  // Cooking mode functions
  const startCookingMode = () => {
    setShowCookingMode(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    const steps = getInstructionSteps(recipe?.instructions || '');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTimer = () => {
    setIsPlaying(!isPlaying);
    // In a real app, you'd implement timer logic here
  };

  // Handle ingredient checkbox changes
  const handleIngredientCheck = (index: number, checked: boolean) => {
    setCheckedIngredients(prev => {
      const newChecked = [...prev];
      newChecked[index] = checked;
      return newChecked;
    });
  };

  // Enhance instruction text with bold key actions
  const enhanceInstructionText = (text: string) => {
    return text
      .replace(/(\d+°[CF])/g, '<strong class="text-orange-600 font-semibold">$1</strong>')
      .replace(/(\d+[-–]\d+\s+minutes?)/gi, '<strong class="text-blue-600 font-semibold">$1</strong>')
      .replace(/(Preheat|Simmer|Boil|Bake|Fry|Sauté|Cook|Mix|Combine|Add|Heat)/gi, '<strong class="text-green-600 font-semibold">$1</strong>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <ChefHat className="w-16 h-16" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Recipe not found</h3>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Mock recipe data - keeping as fallback
  const mockRecipe = {
    title: 'Beetroot Quinoa Salad with Orange Ginger Dressing',
    description: 'A vibrant and nutritious salad combining earthy beetroots with protein-rich quinoa',
    image: null,
    prepTime: '15 min',
    cookTime: '25 min',
    difficulty: 'Easy',
    calories: '320',
    protein: '12g',
    carbs: '45g',
    fat: '10g',
    ingredients: [
      '2 cups quinoa',
      '4 medium beetroots',
      '1/4 cup orange juice',
      '2 tbsp fresh ginger, grated',
      '3 tbsp olive oil',
      '1 tsp honey',
      'Salt and pepper to taste',
      'Fresh herbs for garnish',
    ],
    instructions: [
      'Cook quinoa according to package instructions and let cool',
      'Roast beetroots at 400°F until tender, about 40 minutes',
      'Peel and dice the cooled beetroots',
      'Mix orange juice, ginger, olive oil, and honey for the dressing',
      'Combine quinoa and beetroots in a large bowl',
      'Drizzle with dressing and toss gently',
      'Season with salt and pepper',
      'Garnish with fresh herbs and serve',
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 text-center px-4">
            <h1 className="font-semibold text-gray-900 truncate">{recipe.title}</h1>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900">
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Start Cooking Button */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl border border-emerald-300 shadow-lg">
          <Button 
            onClick={startCookingMode}
            className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-300 h-14 text-lg font-semibold shadow-sm transition-all"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Cooking Mode
          </Button>
          <p className="text-center text-emerald-100 text-sm mt-3">
            Step-by-step guided cooking experience
          </p>
        </div>

        {/* Recipe Image */}
        <div className="w-full h-80 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
          {recipe.image?.url ? (
            <img 
              src={recipe.image.url} 
              alt={recipe.title}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="text-center">
              <ChefHat className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">{recipe.title}</p>
            </div>
          )}
        </div>
        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-black text-4xl font-bold text-foreground leading-tight">{recipe.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {recipe.instructions.substring(0, 180)}...
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              Chef curated
            </span>
            <span>•</span>
            <span>Premium recipe</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-2xl text-center hover:shadow-md transition-all">
            <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-bold text-orange-900">15 min</div>
            <div className="text-sm text-orange-700">Prep Time</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl text-center hover:shadow-md transition-all">
            <Clock className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
            <div className="text-lg font-bold text-emerald-900">25 min</div>
            <div className="text-sm text-emerald-700">Cook Time</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl text-center hover:shadow-md transition-all">
            <ChefHat className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-bold text-blue-900">Medium</div>
            <div className="text-sm text-blue-700">Difficulty</div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Nutrition Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-red-100">
              <div className="text-2xl mb-1">🔥</div>
              <div className="font-bold text-red-800">350</div>
              <div className="text-xs text-red-600">Calories</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-orange-100">
              <div className="text-2xl mb-1">🥩</div>
              <div className="font-bold text-orange-800">20g</div>
              <div className="text-xs text-orange-600">Protein</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-amber-100">
              <div className="text-2xl mb-1">🍞</div>
              <div className="font-bold text-amber-800">30g</div>
              <div className="text-xs text-amber-600">Carbs</div>
            </div>
            <div className="bg-white p-4 rounded-xl text-center shadow-sm border border-green-100">
              <div className="text-2xl mb-1">🥑</div>
              <div className="font-bold text-green-800">15g</div>
              <div className="text-xs text-green-600">Fat</div>
            </div>
          </div>
        </div>

        {/* Servings */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-purple-900">Servings</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-12 h-12 rounded-full bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 transition-all flex items-center justify-center font-bold text-purple-700 shadow-sm"
              >
                −
              </button>
              <span className="w-16 text-center font-bold text-2xl text-purple-900">{servings}</span>
              <button
                onClick={() => setServings(servings + 1)}
                className="w-12 h-12 rounded-full bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 transition-all flex items-center justify-center font-bold text-purple-700 shadow-sm"
              >
                +
              </button>
            </div>
          </div>
          {servings !== originalServings && (
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 text-center font-medium">
                ✨ Ingredients automatically adjusted for {servings} servings
              </p>
            </div>
          )}
        </div>

        {/* Ingredients */}
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 text-teal-900">Ingredients</h2>
          <div className="space-y-3">
            {recipe.ingredients_cleaned.map((ingredient, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                  checkedIngredients[index] 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-white border-teal-200 hover:border-teal-300'
                }`}
                onClick={() => handleIngredientCheck(index, !checkedIngredients[index])}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${
                  checkedIngredients[index]
                    ? 'bg-green-500 border-green-500' 
                    : 'border-teal-300 hover:border-teal-400'
                }`}>
                  {checkedIngredients[index] && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm leading-relaxed flex-1 ${
                  checkedIngredients[index] ? 'line-through text-green-700' : 'text-slate-700'
                }`}>
                  {scaleIngredient(ingredient)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-teal-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-teal-700">
                {checkedIngredients.filter(Boolean).length} of {recipe.ingredients_cleaned.length} gathered
              </span>
              <button
                onClick={() => {
                  const allChecked = checkedIngredients.every(checked => checked);
                  const newState = new Array(recipe.ingredients_cleaned.length).fill(!allChecked);
                  setCheckedIngredients(newState);
                }}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                {checkedIngredients.filter(Boolean).length === recipe.ingredients_cleaned.length ? 'Clear all' : 'Check all'}
              </button>
            </div>
          </div>
        </div>

        {/* Directions */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-indigo-900">Instructions</h2>
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-white px-3 py-2 rounded-full border border-indigo-200">
              <Play className="w-4 h-4" />
              {getInstructionSteps(recipe.instructions).length} steps
            </div>
          </div>
          <div className="space-y-4">
            {getInstructionSteps(recipe.instructions).map((step, index) => (
              <div key={index} className="flex gap-4 p-5 bg-white rounded-xl border border-indigo-200 hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p 
                    className="leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ __html: enhanceInstructionText(step) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cooking Mode Dialog */}
      <Dialog open={showCookingMode} onOpenChange={setShowCookingMode}>
        <DialogContent className="max-w-lg mx-auto h-[85vh] flex flex-col bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-center text-xl font-bold text-orange-900">
              🍳 Cooking Mode
            </DialogTitle>
            <p className="text-center text-orange-700">
              Step {currentStep + 1} of {getInstructionSteps(recipe?.instructions || '').length}
            </p>
          </DialogHeader>

          <div className="flex-1 flex flex-col">
            {/* Progress Bar */}
            <div className="w-full bg-orange-200 rounded-full h-3 mb-6 shadow-inner">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ 
                  width: `${((currentStep + 1) / getInstructionSteps(recipe?.instructions || '').length) * 100}%` 
                }}
              />
            </div>

            {/* Current Step */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ChefHat className="w-14 h-14 text-white" />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-200">
                  <p 
                    className="text-lg leading-relaxed text-slate-700"
                    dangerouslySetInnerHTML={{ 
                      __html: enhanceInstructionText(getInstructionSteps(recipe?.instructions || '')[currentStep]) 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-6 mb-6 p-4 bg-white rounded-2xl shadow-md border border-orange-200">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleTimer}
                className="rounded-full w-14 h-14 p-0 border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-50"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-orange-600" />
                ) : (
                  <Play className="w-6 h-6 text-orange-600" />
                )}
              </Button>
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-orange-900">00:00</div>
                <div className="text-sm text-orange-600 font-medium">Timer</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-md border border-orange-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="text-sm text-orange-600 font-semibold bg-orange-100 px-4 py-2 rounded-full">
                {currentStep + 1} / {getInstructionSteps(recipe?.instructions || '').length}
              </div>

              {currentStep < getInstructionSteps(recipe?.instructions || '').length - 1 ? (
                <Button 
                  onClick={nextStep} 
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setShowCookingMode(false);
                    toast({
                      title: 'Recipe Complete! 🎉',
                      description: 'Great job! Your dish is ready to serve.'
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-md"
                >
                  Complete
                  <ChefHat className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeDetail;
