import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import IngredientInput from "@/components/ingredient-input";
import RecipeCard from "@/components/recipe-card";
import RecipeModal from "@/components/recipe-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, List, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [sortBy, setSortBy] = useState("Best Match");

  // Fetch recipes based on search
  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/recipes/search", searchFilters],
    queryFn: async () => {
      if (!searchFilters) {
        const response = await fetch("/api/recipes");
        return response.json();
      }
      
      const response = await apiRequest("POST", "/api/recipes/search", searchFilters);
      return response.json();
    },
    enabled: true,
  });

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  const sortedRecipes = [...recipes].sort((a, b) => {
    switch (sortBy) {
      case "Best Match":
        // Calculate match percentage for sorting
        const aMatch = a.ingredients.filter((ing: any) =>
          selectedIngredients.some((userIng) =>
            ing.name.toLowerCase().includes(userIng.toLowerCase()) ||
            userIng.toLowerCase().includes(ing.name.toLowerCase())
          )
        ).length / a.ingredients.filter((ing: any) => ing.required).length;
        
        const bMatch = b.ingredients.filter((ing: any) =>
          selectedIngredients.some((userIng) =>
            ing.name.toLowerCase().includes(userIng.toLowerCase()) ||
            userIng.toLowerCase().includes(ing.name.toLowerCase())
          )
        ).length / b.ingredients.filter((ing: any) => ing.required).length;
        
        return bMatch - aMatch;
      case "Preparation Time":
        return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
      case "Rating":
        return b.rating - a.rating;
      case "Difficulty":
        const difficultyOrder = { "Very Easy": 1, "Easy": 2, "Medium": 3, "Hard": 4 };
        return (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 5) - 
               (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 5);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-custom">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Turn Your Ingredients Into{" "}
              <span className="text-primary-custom">Delicious Meals</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Enter what's in your kitchen and discover amazing recipes that use what you have
            </p>
          </div>

          <IngredientInput
            selectedIngredients={selectedIngredients}
            onIngredientsChange={setSelectedIngredients}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Recipe Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recipe Suggestions</h2>
            <p className="text-gray-600">
              {recipesLoading ? "Searching..." : `Found ${recipes.length} recipes`}
              {selectedIngredients.length > 0 && " using your ingredients"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Best Match">Best Match</SelectItem>
                <SelectItem value="Preparation Time">Prep Time</SelectItem>
                <SelectItem value="Rating">Rating</SelectItem>
                <SelectItem value="Difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recipe Grid */}
        {recipesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                userIngredients={selectedIngredients}
                onViewRecipe={setSelectedRecipe}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your ingredients or filters to find more recipes
            </p>
          </div>
        )}
      </div>

      {/* Quick Features Section */}
      <div className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Cooking Success
            </h2>
            <p className="text-xl text-gray-600">
              Smart features to make cooking easier and more enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Heart className="text-primary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Favorites</h3>
              <p className="text-gray-600">Keep track of recipes you love and want to make again</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <List className="text-secondary text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Shopping Lists</h3>
              <p className="text-gray-600">
                Generate shopping lists for missing ingredients automatically
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="text-accent text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe Reviews</h3>
              <p className="text-gray-600">Rate and review recipes to help other home cooks</p>
            </div>
          </div>
        </div>
      </div>

      <RecipeModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        userIngredients={selectedIngredients}
      />
    </div>
  );
}
