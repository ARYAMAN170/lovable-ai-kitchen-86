import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'main', label: 'Main Course', count: 0 },
    { id: 'breakfast', label: 'Breakfast', count: 0 },
    { id: 'dessert', label: 'Dessert', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 bg-gradient-dark">
        <h1 className="text-3xl font-bold mb-2">Favorite Recipes</h1>
        <p className="text-muted-foreground">Your saved culinary inspirations</p>
      </div>

      {/* Category Filter */}
      <div className="p-6 border-b border-border">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.label}
              {category.count > 0 && (
                <span className="ml-2 text-xs opacity-75">
                  ({category.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Start exploring and save recipes you love. They'll appear here for easy access.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
