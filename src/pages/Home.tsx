import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Search, Bell, Utensils, Coffee, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  const userName = user.user_metadata?.name || 'Chef';
  const greeting = 'Good morning';

  const categories = [
    { icon: Utensils, label: 'Special', color: 'text-primary' },
    { icon: Coffee, label: 'Breakfast', color: 'text-secondary' },
    { icon: Sun, label: 'Lunch', color: 'text-accent' },
    { icon: Moon, label: 'Dinner', color: 'text-primary' },
  ];

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
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Warm up your stove,
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          and let's get cooking!
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-12 bg-card border-border h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
              >
                <div className={cn('p-3 rounded-full bg-background', category.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Recipes */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Trending recipes</h3>
          <button className="text-sm text-primary hover:text-accent transition-colors">
            See all
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl overflow-hidden shadow-card">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Utensils className="w-16 h-16 text-muted-foreground" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold mb-2">AI-Generated Recipes</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Start generating custom recipes tailored to your ingredients
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>⏱️ Varies</span>
                <span>⭐ New</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default Home;
