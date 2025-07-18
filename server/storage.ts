import { 
  recipes, 
  userFavorites, 
  shoppingLists, 
  users,
  type Recipe, 
  type InsertRecipe, 
  type UserFavorite, 
  type InsertUserFavorite, 
  type ShoppingList, 
  type InsertShoppingList,
  type User,
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe methods
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]>;
  
  // Favorites methods
  getUserFavorites(userId: number): Promise<Recipe[]>;
  addToFavorites(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFromFavorites(userId: number, recipeId: number): Promise<void>;
  
  // Shopping list methods
  getUserShoppingLists(userId: number): Promise<ShoppingList[]>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  updateShoppingList(id: number, items: any[]): Promise<void>;
  deleteShoppingList(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.passwordHash, saltRounds);
    
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        passwordHash: hashedPassword,
      })
      .returning();
    return newUser;
  }

  // TODO: Implement database methods for recipes, favorites, and shopping lists
  async getAllRecipes(): Promise<Recipe[]> { throw new Error("Not implemented"); }
  async getRecipeById(id: number): Promise<Recipe | undefined> { throw new Error("Not implemented"); }
  async createRecipe(recipe: InsertRecipe): Promise<Recipe> { throw new Error("Not implemented"); }
  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> { throw new Error("Not implemented"); }
  async getUserFavorites(userId: number): Promise<Recipe[]> { throw new Error("Not implemented"); }
  async addToFavorites(favorite: InsertUserFavorite): Promise<UserFavorite> { throw new Error("Not implemented"); }
  async removeFromFavorites(userId: number, recipeId: number): Promise<void> { throw new Error("Not implemented"); }
  async getUserShoppingLists(userId: number): Promise<ShoppingList[]> { throw new Error("Not implemented"); }
  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> { throw new Error("Not implemented"); }
  async updateShoppingList(id: number, items: any[]): Promise<void> { throw new Error("Not implemented"); }
  async deleteShoppingList(id: number): Promise<void> { throw new Error("Not implemented"); }
}

export class MemStorage implements IStorage {
  private recipes: Map<number, Recipe>;
  private userFavorites: Map<number, UserFavorite>;
  private shoppingLists: Map<number, ShoppingList>;
  private users: Map<number, User>;
  private currentRecipeId: number;
  private currentFavoriteId: number;
  private currentListId: number;
  private currentUserId: number;

  constructor() {
    this.recipes = new Map();
    this.userFavorites = new Map();
    this.shoppingLists = new Map();
    this.users = new Map();
    this.currentRecipeId = 1;
    this.currentFavoriteId = 1;
    this.currentListId = 1;
    this.currentUserId = 1;
    
    // Initialize with sample recipes
    this.initializeRecipes();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const usersArray = Array.from(this.users.values());
    return usersArray.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.passwordHash, saltRounds);
    
    const id = this.currentUserId++;
    const newUser: User = {
      id,
      username: user.username,
      email: user.email,
      passwordHash: hashedPassword,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  private initializeRecipes() {
    const sampleRecipes: InsertRecipe[] = [
      {
        title: "Mediterranean Chicken Skillet",
        description: "A delicious one-pan meal with chicken, bell peppers, and tomatoes in Mediterranean herbs",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        difficulty: "Easy",
        cuisine: "Mediterranean",
        dietaryRestrictions: ["gluten-free"],
        ingredients: [
          { name: "chicken breast", amount: "1 lb, diced", required: true },
          { name: "bell peppers", amount: "2, sliced", required: true },
          { name: "tomatoes", amount: "3, chopped", required: true },
          { name: "olive oil", amount: "2 tbsp", required: true },
          { name: "onion", amount: "1, diced", required: true },
          { name: "garlic", amount: "3 cloves, minced", required: true },
          { name: "oregano", amount: "1 tsp", required: true },
          { name: "salt", amount: "to taste", required: true },
          { name: "pepper", amount: "to taste", required: true }
        ],
        instructions: [
          "Heat olive oil in a large skillet over medium-high heat. Season chicken with salt and pepper.",
          "Add chicken to the skillet and cook for 5-6 minutes until golden brown and cooked through.",
          "Add onion and garlic, cook for 2 minutes until fragrant.",
          "Add bell peppers and cook for 3-4 minutes until slightly softened.",
          "Add tomatoes and oregano, cook for 2-3 minutes until tomatoes are heated through. Serve immediately."
        ]
      },
      {
        title: "Asian Chicken Stir Fry",
        description: "Quick and healthy stir fry with tender chicken and crisp vegetables in savory sauce",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        prepTime: 10,
        cookTime: 5,
        servings: 3,
        difficulty: "Easy",
        cuisine: "Asian",
        dietaryRestrictions: [],
        ingredients: [
          { name: "chicken breast", amount: "1 lb, sliced thin", required: true },
          { name: "bell peppers", amount: "2, sliced", required: true },
          { name: "broccoli", amount: "1 cup florets", required: true },
          { name: "soy sauce", amount: "3 tbsp", required: true },
          { name: "garlic", amount: "2 cloves, minced", required: true },
          { name: "ginger", amount: "1 tsp, grated", required: true },
          { name: "vegetable oil", amount: "2 tbsp", required: true },
          { name: "green onions", amount: "2, chopped", required: false }
        ],
        instructions: [
          "Heat oil in a wok or large skillet over high heat.",
          "Add chicken and cook for 3-4 minutes until cooked through.",
          "Add garlic and ginger, stir for 30 seconds until fragrant.",
          "Add bell peppers and broccoli, stir fry for 2-3 minutes until crisp-tender.",
          "Add soy sauce and toss to combine. Garnish with green onions and serve immediately."
        ]
      },
      {
        title: "Fresh Caprese Salad",
        description: "Simple yet elegant salad with fresh tomatoes, mozzarella, and basil",
        image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        difficulty: "Very Easy",
        cuisine: "Italian",
        dietaryRestrictions: ["vegetarian"],
        ingredients: [
          { name: "tomatoes", amount: "2 large, sliced", required: true },
          { name: "mozzarella", amount: "8 oz fresh, sliced", required: true },
          { name: "basil", amount: "1/4 cup fresh leaves", required: true },
          { name: "olive oil", amount: "2 tbsp", required: true },
          { name: "balsamic vinegar", amount: "1 tbsp", required: true },
          { name: "salt", amount: "to taste", required: true },
          { name: "pepper", amount: "to taste", required: true }
        ],
        instructions: [
          "Arrange alternating slices of tomato and mozzarella on a serving plate.",
          "Tuck fresh basil leaves between the slices.",
          "Drizzle with olive oil and balsamic vinegar.",
          "Season with salt and pepper to taste.",
          "Serve immediately at room temperature."
        ]
      },
      {
        title: "Herb-Grilled Chicken & Veggies",
        description: "Perfectly grilled chicken with a medley of roasted seasonal vegetables",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: "Medium",
        cuisine: "American",
        dietaryRestrictions: ["gluten-free"],
        ingredients: [
          { name: "chicken breast", amount: "4 pieces", required: true },
          { name: "bell peppers", amount: "2, cut into chunks", required: true },
          { name: "zucchini", amount: "2, sliced", required: true },
          { name: "olive oil", amount: "3 tbsp", required: true },
          { name: "garlic", amount: "3 cloves, minced", required: true },
          { name: "rosemary", amount: "2 tsp dried", required: true },
          { name: "thyme", amount: "1 tsp dried", required: true },
          { name: "salt", amount: "to taste", required: true },
          { name: "pepper", amount: "to taste", required: true }
        ],
        instructions: [
          "Preheat grill to medium-high heat.",
          "Mix olive oil, garlic, rosemary, thyme, salt, and pepper in a bowl.",
          "Brush chicken and vegetables with herb mixture.",
          "Grill chicken for 6-7 minutes per side until cooked through.",
          "Grill vegetables for 4-5 minutes per side until tender and lightly charred.",
          "Let chicken rest for 5 minutes before serving with vegetables."
        ]
      }
    ];

    sampleRecipes.forEach(recipe => {
      const id = this.currentRecipeId++;
      this.recipes.set(id, {
        ...recipe,
        id,
        rating: Math.floor(Math.random() * 20) + 30, // Random rating between 3.0-5.0
        reviewCount: Math.floor(Math.random() * 200) + 20
      });
    });
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const newRecipe: Recipe = {
      ...recipe,
      id,
      rating: 0,
      reviewCount: 0
    };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async searchRecipesByIngredients(ingredients: string[]): Promise<Recipe[]> {
    const allRecipes = Array.from(this.recipes.values());
    const lowerIngredients = ingredients.map(ing => ing.toLowerCase());
    
    return allRecipes
      .map(recipe => {
        const requiredIngredients = recipe.ingredients.filter((ing: any) => ing.required);
        const matchingIngredients = requiredIngredients.filter((ing: any) => 
          lowerIngredients.some(userIng => 
            ing.name.toLowerCase().includes(userIng) || userIng.includes(ing.name.toLowerCase())
          )
        );
        
        return {
          recipe,
          matchScore: matchingIngredients.length / requiredIngredients.length,
          matchCount: matchingIngredients.length,
          totalRequired: requiredIngredients.length
        };
      })
      .filter(item => item.matchScore > 0) // Only return recipes with at least one matching ingredient
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match percentage
      .map(item => item.recipe);
  }

  async getUserFavorites(userId: number): Promise<Recipe[]> {
    const userFavs = Array.from(this.userFavorites.values())
      .filter(fav => fav.userId === userId);
    
    const favoriteRecipes: Recipe[] = [];
    for (const fav of userFavs) {
      const recipe = this.recipes.get(fav.recipeId);
      if (recipe) {
        favoriteRecipes.push(recipe);
      }
    }
    return favoriteRecipes;
  }

  async addToFavorites(favorite: InsertUserFavorite): Promise<UserFavorite> {
    // Check if already exists
    const existing = Array.from(this.userFavorites.values())
      .find(fav => fav.userId === favorite.userId && fav.recipeId === favorite.recipeId);
    
    if (existing) {
      return existing;
    }

    const id = this.currentFavoriteId++;
    const newFavorite: UserFavorite = { ...favorite, id };
    this.userFavorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<void> {
    const entries = Array.from(this.userFavorites.entries());
    for (const [id, fav] of entries) {
      if (fav.userId === userId && fav.recipeId === recipeId) {
        this.userFavorites.delete(id);
        break;
      }
    }
  }

  async getUserShoppingLists(userId: number): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values())
      .filter(list => list.userId === userId);
  }

  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    const id = this.currentListId++;
    const newList: ShoppingList = { ...list, id };
    this.shoppingLists.set(id, newList);
    return newList;
  }

  async updateShoppingList(id: number, items: any[]): Promise<void> {
    const list = this.shoppingLists.get(id);
    if (list) {
      this.shoppingLists.set(id, { ...list, items });
    }
  }

  async deleteShoppingList(id: number): Promise<void> {
    this.shoppingLists.delete(id);
  }
}

export const storage = new MemStorage();
