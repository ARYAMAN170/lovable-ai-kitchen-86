import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Clock, Users, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const RecipeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [servings, setServings] = useState(4);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock recipe data
  const recipe = {
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
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? 'fill-primary text-primary' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <ChefHat className="w-24 h-24 text-muted-foreground" />
      </div>

      {/* Recipe Content */}
      <div className="p-6 space-y-6">
        {/* Title & Description */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-muted-foreground">{recipe.description}</p>
          <p className="text-xs text-muted-foreground mt-2 italic">
            AI-generated recipe
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-xl text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-semibold">{recipe.prepTime}</div>
            <div className="text-xs text-muted-foreground">Prep</div>
          </div>
          <div className="bg-card p-4 rounded-xl text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-semibold">{recipe.cookTime}</div>
            <div className="text-xs text-muted-foreground">Cook</div>
          </div>
          <div className="bg-card p-4 rounded-xl text-center">
            <ChefHat className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-sm font-semibold">{recipe.difficulty}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
        </div>

        {/* Nutrition */}
        <div className="flex gap-2 flex-wrap">
          <div className="px-3 py-1 bg-card rounded-full text-sm">
            🔥 {recipe.calories} cal
          </div>
          <div className="px-3 py-1 bg-card rounded-full text-sm">
            🥩 {recipe.protein}
          </div>
          <div className="px-3 py-1 bg-card rounded-full text-sm">
            🍞 {recipe.carbs}
          </div>
          <div className="px-3 py-1 bg-card rounded-full text-sm">
            🥑 {recipe.fat}
          </div>
        </div>

        {/* Servings */}
        <div className="flex items-center justify-between bg-card p-4 rounded-xl">
          <span className="font-medium">Servings</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">{servings}</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-card rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Directions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Directions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <p className="flex-1 pt-1">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Start Cooking Button */}
        <Button className="w-full gradient-primary hover:opacity-90 h-12 text-lg">
          Start Cooking
        </Button>
      </div>
    </div>
  );
};

export default RecipeDetail;
