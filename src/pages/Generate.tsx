import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Camera, Sparkles, ChefHat, Heart, Plus, X, Upload, Keyboard, AlertCircle } from 'lucide-react';
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
  
  // Camera-specific state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Enhanced camera functions for better mobile support
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(false);
    setIsCameraLoading(true);
    
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      console.log('Starting camera...');

      // Request camera permission with mobile-optimized constraints
      const constraints = {
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', mediaStream);
      
      setStream(mediaStream);
      
      // Wait for video element to be mounted and try multiple times
      let attempts = 0;
      const maxAttempts = 5; // Reduced since video is now rendered when loading starts
      
      const assignStreamToVideo = () => {
        if (videoRef.current) {
          console.log('Video element found, assigning stream');
          videoRef.current.srcObject = mediaStream;
          
          // Wait for video to be ready before setting active state
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current?.play().then(() => {
              console.log('Video playing, setting camera active');
              setIsCameraActive(true);
              setIsCameraLoading(false);
            }).catch((playError) => {
              console.error('Video play error:', playError);
              setCameraError('Failed to start video playback');
              setIsCameraLoading(false);
            });
          };
          
          // Also try to play immediately in case onloadedmetadata doesn't fire
          setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              videoRef.current.play().catch(console.error);
            }
          }, 500);
          
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Video element not ready, attempt ${attempts}/${maxAttempts}`);
            setTimeout(assignStreamToVideo, 100); // Reduced delay since element should be available
          } else {
            throw new Error('Video element not available after multiple attempts');
          }
        }
      };
      
      // Small delay to ensure video element is in DOM
      setTimeout(assignStreamToVideo, 50);
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permission and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported on this browser.';
        } else {
          errorMessage += error.message;
        }
      }
      
      setCameraError(errorMessage);
      setIsCameraActive(false);
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas element not available');
      toast({
        title: 'Capture failed',
        description: 'Camera elements not ready. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context not available');
      return;
    }

    console.log('Capturing photo...', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState
    });

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw the video frame to canvas (flip back if mirrored)
    context.save();
    context.scale(-1, 1); // Flip horizontally to undo mirror effect
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Photo captured successfully, blob size:', blob.size);
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        handleImageCapture(file);
        stopCamera();
      } else {
        console.error('Failed to create blob from canvas');
        toast({
          title: 'Capture failed',
          description: 'Could not process the captured image.',
          variant: 'destructive'
        });
      }
    }, 'image/jpeg', 0.8);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  // Cleanup camera stream on unmount or dialog close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!showCamera) {
      stopCamera();
    }
  }, [showCamera]);

  // Ensure video element is ready when dialog opens
  useEffect(() => {
    if (showCamera && !isExtractingIngredients && !isCameraActive && !isCameraLoading && !cameraError) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        console.log('Dialog opened, checking video element availability...');
        if (videoRef.current) {
          console.log('Video element is available on dialog open');
        } else {
          console.log('Video element not yet available, will try when camera starts');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showCamera, isExtractingIngredients, isCameraActive, isCameraLoading, cameraError]);

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
    <div className="min-h-screen bg-background pb-20 sm:pb-24">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-dark">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{greeting}</p>
              <h2 className="text-base sm:text-lg font-semibold">{userName}</h2>
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Recipe Collection
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Browse dishes or create new ones
        </p>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${generatedRecipe ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="generate" className="flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Recipe</span>
              <span className="sm:hidden">Generate</span>
            </TabsTrigger>
            {generatedRecipe && (
              <TabsTrigger value="preview" className="flex items-center gap-2 text-sm sm:text-base">
                <ChefHat className="w-4 h-4" />
                <span className="hidden sm:inline">Preview Recipe</span>
                <span className="sm:hidden">Preview</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Generate Recipe Tab */}
          <TabsContent value="generate" className="mt-4 sm:mt-6 space-y-6 sm:space-y-8">
            {/* Manual Ingredient Input Card */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-full flex-shrink-0">
                  <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Add Your Ingredients</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Type ingredients one by one to build your recipe</p>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {ingredientsList.length} ingredient{ingredientsList.length !== 1 ? 's' : ''} added
                </div>
              </div>
              
              {/* Ingredient Input */}
              <div className="space-y-4">
                <div className="flex gap-2 sm:gap-3">
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
                  if (!open) {
                    // Reset camera state when dialog closes
                    setIsCameraActive(false);
                    setIsCameraLoading(false);
                    setCameraError(null);
                    stopCamera();
                  }
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
                <DialogContent className="sm:max-w-lg">
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
                        {/* Camera Error Display */}
                        {cameraError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-medium text-red-800">Camera Access Failed</h4>
                                <p className="text-sm text-red-700 mt-1">{cameraError}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Live Camera View */}
                        {(isCameraActive || isCameraLoading) && (
                          <div className="space-y-4">
                            <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-200">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                controls={false}
                                className="w-full h-64 object-cover bg-black"
                                style={{ transform: 'scaleX(-1)' }} // Mirror for selfie mode
                              />
                              <div className="absolute inset-0 border-2 border-dashed border-white/50 rounded-lg pointer-events-none"></div>
                              
                              {isCameraLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-800 font-medium">Starting camera...</span>
                                  </div>
                                </div>
                              )}
                              
                              {isCameraActive && (
                                <>
                                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <p className="text-white text-sm bg-black/70 px-3 py-2 rounded-full font-medium">
                                      📸 Position ingredients in frame
                                    </p>
                                  </div>
                                  {/* Camera active indicator */}
                                  <div className="absolute top-3 right-3 z-10">
                                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                      LIVE
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {isCameraActive && (
                              <div className="flex gap-3">
                                <Button 
                                  onClick={capturePhoto} 
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                                  size="lg"
                                >
                                  <Camera className="w-5 h-5 mr-2" />
                                  📸 Capture Photo
                                </Button>
                                <Button 
                                  onClick={stopCamera} 
                                  variant="outline" 
                                  className="flex-1 py-3"
                                  size="lg"
                                >
                                  ❌ Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Camera Controls Section */}
                        {!isCameraActive && !isCameraLoading && !cameraError && (
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground text-center">
                              Use your camera to capture ingredients or upload an image from your gallery
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <div className="text-xs text-blue-600 mb-2">🛠️ Debug Info</div>
                              <div className="text-xs text-blue-700">
                                Video Element: {videoRef.current ? '✅ Ready' : '❌ Not Available'}<br/>
                                Dialog Open: {showCamera ? '✅ Yes' : '❌ No'}<br/>
                                Camera Support: {navigator.mediaDevices ? '✅ Yes' : '❌ No'}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              <Button 
                                onClick={() => {
                                  console.log('Camera button clicked');
                                  console.log('Video element available:', !!videoRef.current);
                                  console.log('Dialog open:', showCamera);
                                  startCamera();
                                }}
                                disabled={isCameraLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                              >
                                {isCameraLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Starting Camera...
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-4 h-4 mr-2" />
                                    📸 Open Camera
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline" 
                                className="w-full"
                                disabled={isCameraLoading}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                📁 Upload from Gallery
                              </Button>
                            </div>

                            {/* Hidden file input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                        )}

                        {/* Try Again Option */}
                        {cameraError && (
                          <div className="space-y-3">
                            <Button 
                              onClick={() => {
                                setCameraError(null);
                                startCamera();
                              }}
                              variant="outline" 
                              className="w-full"
                            >
                              Try Camera Again
                            </Button>
                            
                            <Button 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image Instead
                            </Button>

                            {/* Hidden file input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                        )}

                        {/* Hidden canvas for photo capture */}
                        <canvas ref={canvasRef} className="hidden" />
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
