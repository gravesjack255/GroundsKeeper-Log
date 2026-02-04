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

### February 2026 - Equipment Marketplace
- New marketplace feature for listing equipment for sale with full maintenance history visible to buyers
- Database: `marketplaceListings` table with equipmentId, sellerId, askingPrice, description, contactInfo, location, latitude, longitude
- All marketplace API routes require authentication (browsing restricted to logged-in users)
- Protected API: GET /api/marketplace (list with distance filter), GET /api/marketplace/:id (detail), POST /api/marketplace (create), DELETE /api/marketplace/:id (remove)
- Frontend pages: /marketplace (browse listings with distance search), /marketplace/:id (listing detail)
- Location-based features:
  - Sellers enter location (City, State) when posting equipment
  - Location is geocoded to lat/lng via Nominatim OpenStreetMap API
  - Buyers can use browser geolocation to see distance to listings
  - Distance filter options: 50, 100, 250, 500 miles
  - Haversine formula calculates accurate distance in miles
- PostToMarketplaceDialog component on equipment detail page for easy listing creation
- Marketplace link added to header navigation
- Listings show equipment details, price, seller info, location, distance, and complete maintenance history
- Data isolation: users can only create/remove their own listings

### February 2026 - Messaging & Listing Management
- In-app messaging system for buyer-seller communication
- Database: `messages` table with listingId, senderId, receiverId, senderName, content, isRead, createdAt
- Listing status management: active, sold, removed states
- My Listings page (/my-listings) for managing posted equipment:
  - View all your marketplace listings
  - Mark items as sold or relist sold items
  - Delete listings from marketplace
- Messages/Inbox page (/messages) for conversations:
  - View all conversations grouped by listing and user
  - Message threading with 5-second polling for new messages
- Marketplace listing detail page messaging:
  - Buyers can send messages directly to sellers
  - Sellers see "This is your listing" message instead of contact form
  - Link to existing conversations if one exists
- Security: Server validates messaging rules (receiver must be seller, sender cannot be seller)

### February 2026 - UI/UX Improvements
- Inbox tab added to main header navigation (moved from dropdown)
- Unread message count shown as red badge on Inbox tab
- User profile dropdown made opaque (solid background) for better readability
- Dropdown simplified to show only My Listings and Sign Out options

### February 2026 - Cloud Storage for Equipment Photos
- Migrated image uploads from local file storage to Replit Object Storage
- Presigned URL flow for direct client uploads to cloud storage
- Images now persist across app deployments
- Backward compatibility: legacy local images served via /uploads endpoint
- New uploads use /objects/uploads/:objectId endpoint for cloud storage

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development