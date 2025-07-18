# CookSmart Recipe Application

## Overview

This is a full-stack recipe application called "CookSmart" that helps users discover recipes based on available ingredients. The application features recipe search and filtering, favorites management, and shopping list functionality. It's built with a modern React frontend and Express.js backend, using TypeScript throughout.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture with clear separation between frontend and backend concerns:

- **Frontend**: React SPA with TypeScript, using Vite for development and building
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Build System**: Vite with React plugin for fast development and optimized builds
- **UI Framework**: React with TypeScript, using functional components and hooks
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation (via hookform/resolvers)

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL adapter
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Hot reloading with tsx and Vite integration

### Data Models
The application defines three main entities:
- **Recipes**: Complete recipe information including ingredients, instructions, dietary restrictions, and ratings
- **User Favorites**: Many-to-many relationship between users and recipes
- **Shopping Lists**: User-created lists with checkable ingredients

## Data Flow

1. **Recipe Discovery**: Users input available ingredients through an autocomplete interface
2. **Search & Filter**: Backend searches recipes by ingredients and applies additional filters (cuisine, diet, time)
3. **Recipe Display**: Frontend displays results with ingredient match percentages and recipe details
4. **Favorites Management**: Users can save/remove recipes from their favorites list
5. **Shopping Lists**: Users can create and manage shopping lists with ingredients from recipes

The application uses TanStack Query for efficient data fetching, caching, and synchronization between client and server state.

## External Dependencies

### Frontend Dependencies
- **UI Components**: Comprehensive set of Radix UI primitives for accessible components
- **Date Handling**: date-fns for date manipulation
- **Utility Libraries**: clsx and class-variance-authority for conditional styling
- **Carousel**: Embla Carousel for image galleries
- **Command Palette**: cmdk for search interfaces

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL support via Neon Database
- **Validation**: Zod schemas for runtime type checking
- **Session Management**: connect-pg-simple for PostgreSQL-based sessions

### Development Dependencies
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint and Prettier (implied by project structure)
- **Development Tools**: Replit-specific plugins for enhanced development experience

## Deployment Strategy

The application is configured for deployment with:

- **Build Process**: 
  - Frontend builds to `dist/public` via Vite
  - Backend bundles with esbuild to `dist/index.js`
- **Production**: Single command (`npm start`) serves the bundled application
- **Development**: Concurrent frontend and backend development with hot reloading
- **Database**: Uses environment variable `DATABASE_URL` for database connection
- **Static Assets**: Frontend build output served by Express in production

The application includes Replit-specific configurations for seamless deployment and development in the Replit environment, including runtime error overlays and development banners.
