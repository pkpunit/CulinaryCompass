import { pgTable, text, serial, integer, boolean, jsonb, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  userId: integer("user_id").notNull(), // Reference to users table
});

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to users table
  name: text("name").notNull(),
  items: jsonb("items").notNull(), // Array of {ingredient: string, amount: string, checked: boolean}
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema definitions for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
