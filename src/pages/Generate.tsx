import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Camera, Sparkles, ChefHat, Heart, Plus, X, Upload, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { recipeAPI, CreateRecipeData, Recipe, GeneratedRecipe, favoritesAPI } from '@/lib/apiClient';

// Simple recipe generation function (would be replaced with AI in production)
const generateRecipeFromIngredients = (ingredients: string): CreateRecipeData => {
  const ingredientList = ingredients.split('\n').filter(i => i.trim()).map(i => i.trim());
  
  const recipes = [
    {
      title: `Delicious ${ingredientList[0] || 'Mixed'} Bowl`,
      description: `A nutritious and flavorful dish featuring ${ingredientList.slice(0, 3).join(', ')}`,
      prep_time: '15 min',
      cook_time: '20 min',
      difficulty: 'Easy',
      calories: '350',
      protein: '15g',
      carbs: '40g',
      fat: '12g',
      servings: 4
    },
    {
      title: `Savory ${ingredientList[0] || 'Garden'} Stir-Fry`,
      description: `A quick and healthy stir-fry with fresh ${ingredientList.slice(0, 2).join(' and ')}`,
      prep_time: '10 min',
      cook_time: '15 min',
      difficulty: 'Easy',
      calories: '280',
      protein: '12g',
      carbs: '30g',
      fat: '10g',
      servings: 3
    }
  ];

  const selectedRecipe = recipes[Math.floor(Math.random() * recipes.length)];
  
  return {
    ...selectedRecipe,
    ingredients: ingredientList.length > 0 ? ingredientList : ['Salt', 'Pepper', 'Olive oil'],
    instructions: [
      'Prepare all ingredients by washing and chopping as needed',
      'Heat oil in a large pan over medium heat',
      'Add ingredients in order of cooking time required',
      'Season with salt and pepper to taste',
      'Cook until tender and flavors are well combined',
      'Serve hot and enjoy your meal!'
    ]
  };
};

const Generate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isExtractingIngredients, setIsExtractingIngredients] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | null>(null);

  const userName = user?.name || 'Chef';
  const greeting = 'Good morning';



  const addIngredient = () => {
    const ingredient = currentIngredient.trim();
    if (ingredient && !ingredientsList.includes(ingredient)) {
      setIngredientsList([...ingredientsList, ingredient]);
      setCurrentIngredient('');
    } else if (ingredientsList.includes(ingredient)) {
      toast({
        title: 'Duplicate ingredient',
        description: 'This ingredient is already added',
        variant: 'destructive'
      });
    }
  };

  const removeIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const saveGeneratedRecipe = async () => {
    if (!generatedRecipe) return;
    
    setSavingRecipe(true);
    try {
      // Convert generated recipe to Recipe format, include recipe image if available
      const recipe = recipeAPI.convertGeneratedToRecipe(generatedRecipe, recipeImageUrl || undefined);
      
      // Save the recipe locally
      await favoritesAPI.saveGeneratedRecipe(recipe);
      
      // Add to favorites
      await favoritesAPI.addFavorite(recipe._id);
      
      toast({
        title: 'Recipe Saved! 💾',
        description: 'Recipe has been saved to your favorites!'
      });
      
      // Navigate to the saved recipe
      navigate(`/recipe/${recipe._id}`);
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'Unable to save recipe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSavingRecipe(false);
    }
  };

  const handleImageCapture = async (file: File) => {
    setIsExtractingIngredients(true);
    try {
      const response = await recipeAPI.extractIngredientsFromImage(file);
      
      // Add extracted ingredients to the list
      const newIngredients = response.ingredients.filter(
        ingredient => !ingredientsList.includes(ingredient)
      );
      
      setIngredientsList(prev => [...prev, ...newIngredients]);
      setShowCamera(false);
      
      toast({
        title: 'Ingredients Extracted! 🎉',
        description: `Found ${newIngredients.length} new ingredients from your image`
      });
      
    } catch (error) {
      console.error('Error extracting ingredients:', error);
      toast({
        title: 'Extraction failed',
        description: 'Unable to extract ingredients from image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExtractingIngredients(false);
    }
  };

  const generateRecipeImage = async () => {
    if (!generatedRecipe) return;
    
    setIsGeneratingImage(true);
    try {
      const prompt = `${generatedRecipe.title} - ${generatedRecipe.description}. Professional food photography, appetizing, high quality, well lit, restaurant style presentation`;
      console.log('Manual image generation request with prompt:', prompt);
      
      const response = await recipeAPI.generateRecipeImage(prompt);
      console.log('Manual image generation response:', response);
      
      if (response && response.url) {
        console.log('Manual: Setting recipe image URL:', response.url);
        setRecipeImageUrl(response.url);
        
        // Test if URL is valid
        const img = new Image();
        img.onload = () => console.log('Manual: Image URL is valid and loadable');
        img.onerror = (e) => console.error('Manual: Image URL failed to load:', e);
        img.src = response.url;
        
        toast({
          title: 'Recipe Image Generated! 🖼️',
          description: 'A beautiful image has been created for your recipe'
        });
      } else {
        console.error('No url in manual generation response:', response);
        throw new Error('No image URL received from API');
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Image generation failed',
        description: 'Unable to generate recipe image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerate = async () => {
    if (ingredientsList.length === 0) {
      toast({
        title: 'Missing ingredients',
        description: 'Please add some ingredients first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a recipe using AI with the ingredients list
      const ingredientsString = ingredientsList.join(', ');
      const generatedRecipe: GeneratedRecipe = await recipeAPI.generateRecipe(ingredientsString);
      
      toast({
        title: 'Recipe generated! 🍽️',
        description: `Created "${generatedRecipe.title}" using ${ingredientsList.length} ingredients!`
      });
      
      // Store the generated recipe and navigate to preview
      setGeneratedRecipe(generatedRecipe);
      setActiveTab('preview');
      
      // Automatically generate image for the recipe
      setIsGeneratingImage(true);
      try {
        const prompt = `${generatedRecipe.title} - ${generatedRecipe.description}. Professional food photography, appetizing, high quality, well lit, restaurant style presentation`;
        console.log('Sending image generation request with prompt:', prompt);
        
        const response = await recipeAPI.generateRecipeImage(prompt);
        console.log('Image generation response:', response);
        
        if (response && response.url) {
          console.log('Setting recipe image URL:', response.url);
          setRecipeImageUrl(response.url);
          
          // Test if URL is valid
          const img = new Image();
          img.onload = () => console.log('Image URL is valid and loadable');
          img.onerror = (e) => console.error('Image URL failed to load:', e);
          img.src = response.url;
          
          toast({
            title: 'Recipe Image Generated! 🖼️',
            description: 'A beautiful image has been created for your recipe'
          });
        } else {
          console.error('No url in response:', response);
          throw new Error('No image URL received from API');
        }
        
      } catch (imageError) {
        console.error('Error generating image:', imageError);
        // Don't show error toast for image generation failure - it's not critical
      } finally {
        setIsGeneratingImage(false);
      }
      
    } catch (error: any) {
      console.error('Generation error:', error);
      
      let errorMessage = 'Unable to generate recipe. Please try with different ingredients.';
      
      // Handle specific API errors
      if (error.response?.status === 422) {
        errorMessage = 'Invalid ingredient format. Please check your ingredients and try again.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 bg-gradient-dark">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">{greeting}</p>
              <h2 className="text-lg font-semibold">{userName}</h2>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Recipe Collection
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse dishes or create new ones
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${generatedRecipe ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Recipe
            </TabsTrigger>
            {generatedRecipe && (
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Preview Recipe
              </TabsTrigger>
            )}
          </TabsList>

          {/* Generate Recipe Tab */}
          <TabsContent value="generate" className="mt-6 space-y-8">
            {/* Manual Ingredient Input Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Keyboard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Add Your Ingredients</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Type ingredients one by one to build your recipe</p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {ingredientsList.length} ingredient{ingredientsList.length !== 1 ? 's' : ''} added
                </div>
              </div>
              
              {/* Ingredient Input */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter an ingredient (e.g., chicken breast, tomatoes...)"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 bg-background border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground"
                  />
                  <Button
                    onClick={addIngredient}
                    disabled={!currentIngredient.trim()}
                    size="lg"
                    className="px-6 py-3 bg-primary hover:bg-primary/90 transform hover:scale-105 active:scale-95 transition-all duration-150"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Ingredients List */}
                {ingredientsList.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground">Added Ingredients:</div>
                    <div className="flex flex-wrap gap-2">
                      {ingredientsList.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20 shadow-sm"
                        >
                          <span>{ingredient}</span>
                          <button
                            onClick={() => removeIngredient(index)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIngredientsList([])}
                        className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}

                {ingredientsList.length === 0 && (
                  <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Keyboard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No ingredients added yet</p>
                    <p className="text-xs text-muted-foreground">
                      Start by adding ingredients one by one using the input above
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || ingredientsList.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {loading ? 'Generating Recipe...' : `Generate Recipe${ingredientsList.length > 0 ? ` (${ingredientsList.length} ingredients)` : ''}`}
                </Button>
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">
                  Or try our AI-powered feature
                </span>
              </div>
            </div>

            {/* Camera Feature Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-secondary/20 transition-all duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Camera className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Use Camera</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Snap a photo to automatically extract ingredients using AI</p>
                </div>
              </div>
              
              <Dialog open={showCamera} onOpenChange={(open) => {
                if (!isExtractingIngredients) {
                  setShowCamera(open);
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-secondary/10 hover:bg-secondary/20 border-2 border-secondary/30 text-secondary font-medium py-3 px-4 rounded-lg transition-colors"
                    disabled={isExtractingIngredients}
                  >
                    {isExtractingIngredients ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Processing image...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Open Camera
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      {isExtractingIngredients ? 'Processing Image...' : 'Capture Ingredients'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {isExtractingIngredients ? (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          <div className="space-y-2">
                            <div className="text-lg font-semibold">Analyzing your image...</div>
                            <p className="text-sm text-muted-foreground">
                              Our AI is detecting ingredients from your photo
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span>This may take a few seconds</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Upload an image of your ingredients and we'll automatically detect and add them to your list.
                        </div>
                        
                        <Input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageCapture(file);
                            }
                          }}
                          className="file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          disabled={isExtractingIngredients}
                        />
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Upload className="w-3 h-3" />
                          <span>Or upload from gallery</span>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* Recipe Preview Tab */}
          {generatedRecipe && (
            <TabsContent value="preview" className="mt-6 space-y-6">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{generatedRecipe.title}</h2>
                    <p className="text-sm text-muted-foreground">AI Generated Recipe</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {generatedRecipe.description}
                </p>

                {/* Recipe Image */}
                <div className="mb-6">
                  {isGeneratingImage ? (
                    <div className="bg-background/50 p-6 rounded-lg border border-dashed text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <div className="text-sm font-medium">Generating recipe image...</div>
                        <p className="text-xs text-muted-foreground">
                          Creating a beautiful image for your {generatedRecipe.title}
                        </p>
                      </div>
                    </div>
                  ) : recipeImageUrl ? (
                    <div className="relative bg-background/50 rounded-lg p-3">
                      <div className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-lg overflow-hidden shadow-inner">
                        <img 
                          src={recipeImageUrl} 
                          alt={generatedRecipe.title}
                          className="w-full h-80 object-cover"
                          onLoad={() => console.log('Image loaded successfully:', recipeImageUrl)}
                          onError={(e) => {
                            console.error('Image failed to load:', recipeImageUrl);
                            console.error('Image error event:', e);
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>AI Generated Image</span>
                          <span>•</span>
                          <span>Cloudinary: {recipeImageUrl.includes('cloudinary') ? '✓' : '✗'}</span>
                        </div>
                        <Button 
                          onClick={generateRecipeImage}
                          disabled={isGeneratingImage}
                          size="sm"
                          variant="outline"
                        >
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background/50 p-6 rounded-lg border border-dashed text-center">
                      <div className="text-muted-foreground text-sm mb-2">Image generation failed</div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Unable to generate image for this recipe
                      </p>
                      <Button 
                        onClick={generateRecipeImage}
                        disabled={isGeneratingImage}
                        size="sm"
                        variant="outline"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recipe Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-background/50 p-3 rounded-lg text-center">
                    <div className="text-sm font-semibold">{generatedRecipe.servings}</div>
                    <div className="text-xs text-muted-foreground">Servings</div>
                  </div>
                  <div className="bg-background/50 p-3 rounded-lg text-center">
                    <div className="text-sm font-semibold">{generatedRecipe.prep_time}</div>
                    <div className="text-xs text-muted-foreground">Prep Time</div>
                  </div>
                  <div className="bg-background/50 p-3 rounded-lg text-center">
                    <div className="text-sm font-semibold">{generatedRecipe.cook_time}</div>
                    <div className="text-xs text-muted-foreground">Cook Time</div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-background/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">{ingredient.item}</div>
                        <div className="text-xs text-muted-foreground">{ingredient.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <div className="space-y-3">
                    {generatedRecipe.instructions.map((step, index) => (
                      <div key={index} className="flex gap-3 bg-background/50 p-3 rounded-lg">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => {
                      setActiveTab('generate');
                      setIngredientsList([]);
                      setCurrentIngredient('');
                      setGeneratedRecipe(null);
                      setRecipeImageUrl(null);
                      setIsGeneratingImage(false);
                    }}
                    variant="outline" 
                    className="flex-1"
                  >
                    Generate Another
                  </Button>
                  <Button 
                    onClick={saveGeneratedRecipe}
                    disabled={savingRecipe}
                    className="flex-1 flex items-center gap-2"
                  >
                    {savingRecipe ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Heart className="w-4 h-4" />
                        Save to Favorites
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Generate;
