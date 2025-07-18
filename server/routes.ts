import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserFavoriteSchema, insertShoppingListSchema, loginSchema, registerSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isNotAuthenticated } from "./auth";
import passport from "passport";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Authentication routes
  app.post("/api/auth/register", isNotAuthenticated, async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        passwordHash: validatedData.password,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      });

      // Automatically log in the user
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.json({ 
          message: "Registration successful", 
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", isNotAuthenticated, (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.json({ 
            message: "Login successful", 
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            }
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", isAuthenticated, (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  });

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
  app.get("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const favorites = await storage.getUserFavorites(user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = insertUserFavoriteSchema.parse({
        ...req.body,
        userId: user.id
      });
      const favorite = await storage.addToFavorites(validatedData);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:recipeId", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { recipeId } = req.params;
      await storage.removeFromFavorites(user.id, parseInt(recipeId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Shopping list routes
  app.get("/api/shopping-lists", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const lists = await storage.getUserShoppingLists(user.id);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.post("/api/shopping-lists", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const validatedData = insertShoppingListSchema.parse({
        ...req.body,
        userId: user.id
      });
      const list = await storage.createShoppingList(validatedData);
      res.json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  app.put("/api/shopping-lists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { items } = req.body;
      await storage.updateShoppingList(id, items);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update shopping list" });
    }
  });

  app.delete("/api/shopping-lists/:id", isAuthenticated, async (req, res) => {
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
