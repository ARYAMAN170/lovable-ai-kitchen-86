import { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/lib/apiClient';
import { Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeGridProps {
  recipes: Recipe[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: string;
  emptyStateOnAction?: () => void;
}

export interface RecipeGridRef {
  lastRecipeElementRef: (node: HTMLDivElement) => void;
}

const RecipeGrid = forwardRef<RecipeGridRef, RecipeGridProps>(({
  recipes,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyStateTitle = "Start Your Culinary Journey",
  emptyStateDescription = "Connect your backend to see delicious recipes",
  emptyStateAction = "Browse Recipes",
  emptyStateOnAction
}, ref) => {
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver>();

  const lastRecipeElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, onLoadMore]);

  useImperativeHandle(ref, () => ({
    lastRecipeElementRef
  }));

  const LoadingSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-t-lg h-36"></div>
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden border-2 border-dashed border-primary/30">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 text-primary" />
        </div>
        <h4 className="font-semibold text-lg mb-2">{emptyStateTitle}</h4>
        <p className="text-sm text-muted-foreground mb-4">{emptyStateDescription}</p>
        {emptyStateOnAction && (
          <button 
            onClick={emptyStateOnAction}
            className="px-6 py-3 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            {emptyStateAction}
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              index={index}
              ref={index === recipes.length - 1 ? lastRecipeElementRef : null}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
      
      {/* Loading more indicator */}
      {loadingMore && (
        <div className="mt-2">
          <LoadingSkeleton count={4} />
        </div>
      )}
      
      {/* End message */}
      {!hasMore && recipes.length > 0 && (
        <div className="text-center py-6">
          <p className="text-base font-medium text-muted-foreground">You've reached the end! 🍽️</p>
          <p className="text-sm text-muted-foreground mt-1">Great job exploring all the recipes!</p>
        </div>
      )}
    </>
  );
});

RecipeGrid.displayName = 'RecipeGrid';

export default RecipeGrid;