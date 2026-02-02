# TurfTrack - Golf Course Equipment Management System

## Overview

TurfTrack is a full-stack web application for managing golf course equipment and maintenance records. It provides a dashboard for tracking equipment fleet status, logging maintenance activities, and visualizing maintenance costs over time. The system is designed for golf course superintendents to manage their machinery inventory and service history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed color palette (turf greens, sand accents)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for maintenance cost visualization

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe contracts
- **Development Server**: Vite middleware for HMR during development
- **Production Build**: esbuild bundles server code, Vite builds client assets

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` contains all table definitions and relations
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # UI components (equipment, maintenance, layout)
│       ├── hooks/        # Custom React hooks for data fetching
│       ├── pages/        # Route page components
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
└── shared/           # Shared types and contracts
    ├── schema.ts     # Drizzle table definitions
    └── routes.ts     # API contract definitions with Zod
```

### Key Design Patterns
- **Shared Types**: Schema and API contracts defined once in `shared/` folder, used by both client and server
- **Storage Interface**: `IStorage` interface in `storage.ts` abstracts database operations
- **Type-Safe APIs**: Zod schemas validate both request inputs and response shapes
- **Component Composition**: Shadcn/ui components with consistent styling conventions

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express sessions

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **@tanstack/react-query**: Data fetching and caching
- **zod / drizzle-zod**: Schema validation and type generation
- **recharts**: Data visualization for maintenance costs
- **date-fns**: Date formatting utilities
- **lucide-react**: Icon library

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development