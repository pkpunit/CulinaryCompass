import { useState } from "react";
import { Recipe } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Clock,
  Users,
  ChefHat,
  Star,
  ShoppingCart,
  Share,
  Play,
  CheckCircle,
  Circle,
} from "lucide-react";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  userIngredients: string[];
}

export default function RecipeModal({ recipe, isOpen, onClose, userIngredients }: RecipeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "demo-user";

  // Query to check if recipe is favorited
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
  });

  const isFavorited = recipe ? favorites.some((fav: Recipe) => fav.id === recipe.id) : false;

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!recipe) return;
      if (isFavorited) {
        return apiRequest("DELETE", `/api/favorites/${userId}/${recipe.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", {
          userId,
          recipeId: recipe.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", userId] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited 
          ? `${recipe?.title} has been removed from your favorites`
          : `${recipe?.title} has been added to your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  // Create shopping list mutation
  const createShoppingListMutation = useMutation({
    mutationFn: async () => {
      if (!recipe) return;
      
      const missingIngredients = recipe.ingredients.filter((ing: any) =>
        !userIngredients.some((userIng) =>
          ing.name.toLowerCase().includes(userIng.toLowerCase()) ||
          userIng.toLowerCase().includes(ing.name.toLowerCase())
        )
      );

      const items = missingIngredients.map((ing: any) => ({
        ingredient: ing.name,
        amount: ing.amount,
        checked: false,
      }));

      return apiRequest("POST", "/api/shopping-lists", {
        userId,
        name: `Shopping list for ${recipe.title}`,
        items,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", userId] });
      toast({
        title: "Shopping list created",
        description: "Missing ingredients have been added to your shopping list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shopping list",
        variant: "destructive",
      });
    },
  });

  if (!recipe) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 10);
    const hasHalfStar = (rating % 10) >= 5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const isIngredientAvailable = (ingredientName: string) => {
    return userIngredients.some((userIng) =>
      ingredientName.toLowerCase().includes(userIng.toLowerCase()) ||
      userIng.toLowerCase().includes(ingredientName.toLowerCase())
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Recipe link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{recipe.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recipe Image and Info */}
          <div>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                {renderStars(recipe.rating)}
                <span className="text-gray-600 text-sm ml-2">
                  {(recipe.rating / 10).toFixed(1)} ({recipe.reviewCount} reviews)
                </span>
              </div>
              <Button
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
                className={`${
                  isFavorited ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                } text-white`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Remove from Favorites" : "Save Recipe"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="text-primary mb-2 mx-auto" />
                <div className="text-sm text-gray-600">Prep Time</div>
                <div className="font-semibold">{recipe.prepTime} min</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <ChefHat className="text-primary mb-2 mx-auto" />
                <div className="text-sm text-gray-600">Cook Time</div>
                <div className="font-semibold">{recipe.cookTime} min</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="text-primary mb-2 mx-auto" />
                <div className="text-sm text-gray-600">Servings</div>
                <div className="font-semibold">{recipe.servings}</div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">{recipe.description}</p>

            {recipe.dietaryRestrictions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Dietary Information</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryRestrictions.map((restriction) => (
                    <Badge key={restriction} variant="secondary">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ingredients and Instructions */}
          <div>
            {/* Ingredients Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Ingredients</h3>
                <Button
                  onClick={() => createShoppingListMutation.mutate()}
                  disabled={createShoppingListMutation.isPending}
                  className="bg-secondary text-white hover:bg-secondary/90 text-sm"
                >
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Add Missing to Cart
                </Button>
              </div>

              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient: any, index: number) => {
                  const available = isIngredientAvailable(ingredient.name);
                  return (
                    <li key={index} className="flex items-center">
                      {available ? (
                        <CheckCircle className="text-secondary mr-3 h-5 w-5" />
                      ) : (
                        <Circle className="text-gray-300 mr-3 h-5 w-5" />
                      )}
                      <span className={available ? "" : "text-gray-500"}>
                        {ingredient.amount} {ingredient.name}
                      </span>
                      <span
                        className={`ml-auto text-sm font-medium ${
                          available ? "text-secondary" : "text-orange-600"
                        }`}
                      >
                        {available ? "✓ Have" : "Need"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Instructions Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Recipe Actions */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-wrap gap-4">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <Play className="mr-2 h-4 w-4" />
              Start Cooking
            </Button>
            <Button
              onClick={() => createShoppingListMutation.mutate()}
              disabled={createShoppingListMutation.isPending}
              className="bg-secondary text-white hover:bg-secondary/90"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Shopping List
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
