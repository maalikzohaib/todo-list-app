# Overview

This is a full-stack task management application built with React/TypeScript frontend and Express.js backend. The app provides a clean interface for creating, updating, and managing tasks with a simple todo-style workflow. The frontend uses modern UI components from shadcn/ui with Tailwind CSS for styling, while the backend provides RESTful API endpoints for task operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite build system
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation integration

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for task CRUD operations
- **Data Storage**: Dual storage approach - in-memory storage with file persistence (tasks.json)
- **Validation**: Zod schemas for runtime type checking and validation
- **Development**: Hot reloading with tsx, production builds with esbuild

## Database Schema
- **Tasks**: Simple structure with id, title, and status (pending/done)
- **Users**: Basic user structure with id, username, and password (setup for future authentication)
- **ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in TypeScript

## API Structure
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update existing task
- Task operations include status toggling between "pending" and "done"

# External Dependencies

## Core Frontend Dependencies
- **React**: UI framework with hooks and modern patterns
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

## Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: TypeScript-first ORM for database operations
- **Neon Database**: Serverless PostgreSQL database service
- **Connect PG Simple**: PostgreSQL session store for Express

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production
- **Drizzle Kit**: Database migration and schema management tools