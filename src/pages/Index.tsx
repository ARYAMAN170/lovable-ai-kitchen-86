import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles, Camera, Heart } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary">
          <ChefHat className="w-16 h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-dark px-4">
      <div className="text-center max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-center mb-8">
          <ChefHat className="w-20 h-20 text-primary mr-4" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Lovable
          </h1>
        </div>
        
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Find Your Next Favorite Dish
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8">
          AI-powered recipe discovery at your fingertips. Generate custom recipes from ingredients, explore endless possibilities, and save your favorites.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-card shadow-card">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Generate unique recipes using advanced AI technology
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card shadow-card">
            <Camera className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Image Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Snap a photo of your ingredients and get instant recipes
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card shadow-card">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Save Favorites</h3>
            <p className="text-sm text-muted-foreground">
              Keep track of recipes you love for easy access
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="w-full md:w-auto px-12 text-lg gradient-primary hover:opacity-90 transition-opacity"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
