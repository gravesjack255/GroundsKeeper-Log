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
- **multer**: File upload handling for equipment photos

## Recent Changes

### February 2026 - User Authentication & Multi-User Support
- Integrated Replit Auth for secure login (supports Google, GitHub, X, Apple, email)
- Added userId ownership to equipment and maintenanceLogs schemas
- All API routes protected with authentication middleware
- User data isolation: users can only see/modify their own equipment and logs
- Landing page for unauthenticated users with marketing content
- Header shows user profile dropdown with name, email, and sign out option
- Created subscription config (shared/config.ts) for easy future paywall toggle
- Currently free to use; infrastructure ready for paid subscriptions

### February 2026 - Photo Upload Feature
- Added file upload capability for equipment photos (from device photo library instead of URL input)
- Backend: `/api/upload` endpoint handles multipart form data with multer
- Static file serving from `/uploads` directory for uploaded images
- ImageUpload component with drag-and-drop area, preview, and removal
- AddEquipmentDialog and EditEquipmentDialog both support photo upload
- Client and server-side validation for file size (10MB max) and types (JPEG, PNG, GIF, WebP)

### February 2026 - Time Period Chart Options
- Dashboard maintenance cost chart now has selectable time periods: Year-to-Date, 6 Months, Monthly (weekly breakdown)
- Equipment Detail page includes new "Maintenance Spend" card with YTD, 6 Month, and All Time filters
- Chart titles update dynamically based on selected period

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development