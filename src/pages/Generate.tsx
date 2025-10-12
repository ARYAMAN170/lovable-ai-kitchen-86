import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const Generate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);

  const userName = user?.user_metadata?.name || 'Chef';
  const greeting = 'Good morning';

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      toast({
        title: 'Missing ingredients',
        description: 'Please enter some ingredients first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    // TODO: Call edge function to generate recipe
    toast({
      title: 'Coming soon!',
      description: 'Recipe generation will be implemented soon'
    });
    setLoading(false);
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
          Generate Your Recipe
        </h1>
        <p className="text-lg text-muted-foreground">
          Enter ingredients you have on hand
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Your Ingredients</label>
          <Textarea
            placeholder="Enter your list of ingredients...&#10;e.g., chicken, pasta, broccoli, garlic"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="min-h-[200px] bg-card border-border resize-none"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full gradient-primary hover:opacity-90 h-12"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {loading ? 'Generating...' : 'Generate Recipe'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-secondary/10">
              <Camera className="w-8 h-8 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Use Camera</h3>
              <p className="text-sm text-muted-foreground">
                Snap a photo of your ingredients
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              toast({
                title: 'Coming soon!',
                description: 'Camera feature will be implemented soon'
              });
            }}
          >
            Open Camera
          </Button>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
          <h3 className="font-semibold mb-2">Don't know what to cook?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Let AI surprise you with a random recipe
          </p>
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            onClick={() => {
              toast({
                title: 'Coming soon!',
                description: 'Random recipe feature will be implemented soon'
              });
            }}
          >
            Random Recipe →
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Generate;
