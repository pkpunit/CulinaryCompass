import { Recipe } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Users, Signal, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecipeCardProps {
  recipe: Recipe;
  userIngredients: string[];
  onViewRecipe: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, userIngredients, onViewRecipe }: RecipeCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "demo-user"; // In a real app, this would come from auth

  // Query to check if recipe is favorited
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
  });

  const isFavorited = favorites.some((fav: Recipe) => fav.id === recipe.id);

  // Calculate ingredient match
  const requiredIngredients = recipe.ingredients.filter((ing: any) => ing.required);
  const matchingIngredients = requiredIngredients.filter((ing: any) =>
    userIngredients.some((userIng) =>
      ing.name.toLowerCase().includes(userIng.toLowerCase()) ||
      userIng.toLowerCase().includes(ing.name.toLowerCase())
    )
  );
  const matchPercentage = requiredIngredients.length > 0 
    ? matchingIngredients.length / requiredIngredients.length 
    : 0;

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
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
          ? `${recipe.title} has been removed from your favorites`
          : `${recipe.title} has been added to your favorites`,
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Very Easy":
        return "text-green-600";
      case "Easy":
        return "text-green-500";
      case "Medium":
        return "text-yellow-600";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 0.8) return "text-secondary";
    if (percentage >= 0.5) return "text-yellow-600";
    return "text-orange-600";
  };

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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <div onClick={() => onViewRecipe(recipe)}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 cursor-pointer"
              onClick={() => onViewRecipe(recipe)}>
            {recipe.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 ${isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteMutation.mutate();
            }}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {renderStars(recipe.rating)}
            <span className="text-gray-600 text-sm ml-2">
              {(recipe.rating / 10).toFixed(1)} ({recipe.reviewCount} reviews)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center">
            <Signal className={`h-4 w-4 mr-1 ${getDifficultyColor(recipe.difficulty)}`} />
            <span className={getDifficultyColor(recipe.difficulty)}>{recipe.difficulty}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getMatchColor(matchPercentage)}`}>
            Uses {matchingIngredients.length}/{requiredIngredients.length} of your ingredients
          </span>
          <Button
            onClick={() => onViewRecipe(recipe)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            View Recipe
          </Button>
        </div>

        {recipe.dietaryRestrictions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.dietaryRestrictions.map((restriction) => (
              <Badge key={restriction} variant="outline" className="text-xs">
                {restriction}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
