import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserFavoriteSchema, insertShoppingListSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes/search", async (req, res) => {
    try {
      const { ingredients = [], cuisine, diet, maxTime } = req.body;
      let recipes = await storage.searchRecipesByIngredients(ingredients);
      
      // Apply additional filters
      if (cuisine && cuisine !== "Any Cuisine") {
        recipes = recipes.filter(recipe => recipe.cuisine === cuisine);
      }
      
      if (diet && diet !== "Any Diet") {
        const dietFilter = diet.toLowerCase().replace('-', '');
        recipes = recipes.filter(recipe => 
          recipe.dietaryRestrictions.some(restriction => 
            restriction.toLowerCase().replace('-', '') === dietFilter
          )
        );
      }
      
      if (maxTime && maxTime !== "Any Time") {
        let timeLimit: number;
        switch (maxTime) {
          case "Under 15 min":
            timeLimit = 15;
            break;
          case "15-30 min":
            timeLimit = 30;
            break;
          case "30-60 min":
            timeLimit = 60;
            break;
          default:
            timeLimit = Infinity;
        }
        
        if (timeLimit !== Infinity) {
          recipes = recipes.filter(recipe => (recipe.prepTime + recipe.cookTime) <= timeLimit);
        }
      }
      
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search recipes" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedData = insertUserFavoriteSchema.parse(req.body);
      const favorite = await storage.addToFavorites(validatedData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
    try {
      const { userId, recipeId } = req.params;
      await storage.removeFromFavorites(userId, parseInt(recipeId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Shopping list routes
  app.get("/api/shopping-lists/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const lists = await storage.getUserShoppingLists(userId);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    try {
      const validatedData = insertShoppingListSchema.parse(req.body);
      const list = await storage.createShoppingList(validatedData);
      res.json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  app.put("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { items } = req.body;
      await storage.updateShoppingList(id, items);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update shopping list" });
    }
  });

  app.delete("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteShoppingList(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shopping list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
