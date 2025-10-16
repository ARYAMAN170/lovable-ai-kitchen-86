import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Utensils } from 'lucide-react';
import { Recipe } from '@/lib/apiClient';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
  className?: string;
}

const RecipeCard = forwardRef<HTMLDivElement, RecipeCardProps>(({ recipe, index = 0, className = '' }, ref) => {
  const navigate = useNavigate();

  return (
    <div 
      ref={ref}
      className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-200 dark:border-gray-700 ${className}`}
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
        <Utensils className="w-6 h-6 text-muted-foreground hidden absolute inset-0 m-auto" />
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
          {recipe.title}
        </h4>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Quick
          </span>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
            {recipe.ingredients_cleaned.length} items
          </span>
        </div>
      </div>
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';

export default RecipeCard;