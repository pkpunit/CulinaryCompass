import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  prepTime: integer("prep_time").notNull(),
  cookTime: integer("cook_time").notNull(),
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(), // "Very Easy", "Easy", "Medium", "Hard"
  cuisine: text("cuisine").notNull(),
  dietaryRestrictions: text("dietary_restrictions").array().notNull(),
  ingredients: jsonb("ingredients").notNull(), // Array of {name: string, amount: string, required: boolean}
  instructions: text("instructions").array().notNull(),
  rating: integer("rating").notNull().default(0), // Average rating * 10 (so 42 = 4.2)
  reviewCount: integer("review_count").notNull().default(0),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  userId: text("user_id").notNull(), // Simple user identifier for demo
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  items: jsonb("items").notNull(), // Array of {ingredient: string, amount: string, checked: boolean}
  createdAt: text("created_at").notNull(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  rating: true,
  reviewCount: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
