import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";

interface IngredientInputProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSearch: (filters: {
    ingredients: string[];
    cuisine: string;
    diet: string;
    maxTime: string;
  }) => void;
}

const commonIngredients = [
  "chicken breast", "ground beef", "salmon", "eggs", "milk", "cheese",
  "tomatoes", "onion", "garlic", "bell peppers", "carrots", "potatoes",
  "rice", "pasta", "bread", "olive oil", "butter", "salt", "pepper",
  "basil", "oregano", "thyme", "broccoli", "spinach", "mushrooms"
];

export default function IngredientInput({
  selectedIngredients,
  onIngredientsChange,
  onSearch,
}: IngredientInputProps) {
  const [input, setInput] = useState("");
  const [cuisine, setCuisine] = useState("Any Cuisine");
  const [diet, setDiet] = useState("Any Diet");
  const [maxTime, setMaxTime] = useState("Any Time");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.length > 1) {
      const filtered = commonIngredients.filter(
        (ingredient) =>
          ingredient.toLowerCase().includes(value.toLowerCase()) &&
          !selectedIngredients.includes(ingredient)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addIngredient = (ingredient: string) => {
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      onIngredientsChange([...selectedIngredients, ingredient]);
      setInput("");
      setSuggestions([]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter((item) => item !== ingredient));
  };

  const handleSearch = () => {
    onSearch({
      ingredients: selectedIngredients,
      cuisine,
      diet,
      maxTime,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="mb-4">
        <Label className="block text-sm font-semibold text-gray-700 mb-2">
          <Search className="inline mr-2 h-4 w-4" />
          What ingredients do you have?
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="Type an ingredient (e.g. chicken, tomatoes, rice)"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addIngredient(input);
              }
            }}
            className="text-lg pr-12"
          />
          <Button
            type="button"
            size="sm"
            className="absolute right-3 top-2 h-8 w-8 p-0"
            onClick={() => addIngredient(input)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => addIngredient(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Ingredients */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border border-gray-200 rounded-lg bg-gray-50">
          {selectedIngredients.length > 0 ? (
            selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient}
                variant="secondary"
                className="bg-secondary text-white hover:bg-secondary/90"
              >
                {ingredient}
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-2 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <span className="text-gray-500 text-sm py-1">
              Add ingredients to see recipe suggestions...
            </span>
          )}
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={cuisine} onValueChange={setCuisine}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any Cuisine">Any Cuisine</SelectItem>
            <SelectItem value="Italian">Italian</SelectItem>
            <SelectItem value="Mexican">Mexican</SelectItem>
            <SelectItem value="Asian">Asian</SelectItem>
            <SelectItem value="Mediterranean">Mediterranean</SelectItem>
            <SelectItem value="American">American</SelectItem>
          </SelectContent>
        </Select>

        <Select value={diet} onValueChange={setDiet}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any Diet">Any Diet</SelectItem>
            <SelectItem value="Vegetarian">Vegetarian</SelectItem>
            <SelectItem value="Vegan">Vegan</SelectItem>
            <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
            <SelectItem value="Keto">Keto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={maxTime} onValueChange={setMaxTime}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any Time">Any Time</SelectItem>
            <SelectItem value="Under 15 min">Under 15 min</SelectItem>
            <SelectItem value="15-30 min">15-30 min</SelectItem>
            <SelectItem value="30-60 min">30-60 min</SelectItem>
            <SelectItem value="Over 1 hour">Over 1 hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSearch}
        className="w-full bg-primary text-white py-3 text-lg font-semibold hover:bg-primary/90"
      >
        <Search className="mr-2 h-5 w-5" />
        Find Recipes
      </Button>
    </div>
  );
}
