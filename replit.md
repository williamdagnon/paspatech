# PASPA TECH - African Agricultural PDF Platform

## Overview

PASPA TECH is a professional e-commerce platform for selling agricultural PDF guides focused on African farming techniques (onion, chili, cassava, tomato, ginger, etc.). The platform features a two-zone ambassador/affiliate system covering different African regions, automated commission payments (70% ambassador / 30% platform), quota management (50,000 PDFs per zone), and an admin dashboard for oversight. Content is in French. The platform enforces RGPD compliance and includes security measures against fraud.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (green + orange brand colors, white background)
- **Animations**: Framer Motion for page transitions and interactive elements
- **Charts**: Recharts for dashboard analytics
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Carousel**: Embla Carousel for the hero banner (3 animated African agriculture images)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Pages
- Landing (hero carousel, featured products)
- Products (PDF guide catalog with "Add to Cart" buttons)
- Cart (shopping cart with quantity management, payment method selection, checkout)
- Login (email/password login for all users)
- Register (customer registration with email/password)
- Ambassador Signup (zone selection, profile creation, email/password registration)
- Ambassador Dashboard (sales stats, referral link, charts)
- Admin Dashboard (platform-wide stats by zone, ambassador management/approval)
- About, Contact, FAQ, Terms/Privacy (static content pages)
- 404 Not Found

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via tsx
- **API Pattern**: RESTful JSON API under `/api/*` prefix
- **Route Definitions**: Shared route contracts in `shared/routes.ts` with Zod schemas for input validation and response typing
- **Build**: Custom build script using esbuild (server) + Vite (client), outputs to `dist/`

### Authentication
- **Custom email/password** authentication using bcryptjs for password hashing
- Sessions stored in PostgreSQL via `connect-pg-simple` (express-session)
- Auth API routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/register-ambassador`, `/api/auth/logout`, `/api/auth/user`
- Auth middleware: `isAuthenticated` guard for protected routes (checks `req.session.userId`)
- Three registration flows: customer (simple), ambassador (extended with zone/phone/contracts), unified login
- Shopping cart: Client-side React Context (`CartProvider` in `use-cart.tsx`), persists in memory during session

### Database
- **Database**: PostgreSQL (required, connected via `DATABASE_URL` env var)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation generation
- **Schema location**: `shared/schema.ts` and `shared/models/auth.ts`
- **Migrations**: Drizzle Kit with `db:push` command, output to `./migrations/`
- **Key Tables**:
  - `users` - Replit Auth user records (id, email, name, profile image)
  - `sessions` - Express session storage for auth
  - `user_profiles` - Application-specific user data (role: admin/ambassador/customer, zone: zone1/zone2, approval status, quota tracking)
  - `products` - PDF guides (name, description, price in FCFA, file URL, cover image)
  - `orders` - Purchase records (linked to user/guest, product, payment status, ambassador referral, zone isolation)
  - `commissions` - Ambassador earnings tracking (70/30 split)

### Storage Layer
- `server/storage.ts` implements `IStorage` interface with `DatabaseStorage` class
- Separate auth storage in `server/replit_integrations/auth/storage.ts`

### Key Business Logic
- **Two Ambassador Zones**: Zone 1 (Sub-Saharan Africa), Zone 2 (Other African countries like Morocco, Tunisia). Zones are isolated — ambassadors only see their own zone, funds never mix between zones.
- **Quota System**: 50,000 PDF downloads max per zone (aggregated across all ambassadors in that zone)
- **Commission Model**: 70% to ambassador, 30% to PASPA TECH, at 500 FCFA per PDF
- **Payment**: Integrated with FedaPay for secure mobile money and card payments across West Africa
- **PDF Protection**: PDFs include no-resale notices, are PASPA TECH exclusive property, and download only after payment confirmation
- **Admin Controls**: Owner can approve/reject ambassadors, view per-zone analytics, manually select next ambassador

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connected via `DATABASE_URL` environment variable. Used for all data storage including auth sessions.
- **Replit Auth (OIDC)**: Authentication provider. Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables.

### Payment Integrations
- **FedaPay**: Primary payment aggregator supporting mobile money (Orange Money, Wave, Moov, Free Cash) and card payments across Senegal, Côte d'Ivoire, Mali, and Burkina Faso
- Requires `FEDAPAY_PUBLIC_KEY` and `FEDAPAY_SECRET_KEY` environment variables
- Sandbox mode available for testing without real transactions

### Frontend Assets
- **Unsplash**: Hero images sourced from Unsplash with agricultural/tech keywords
- **Google Fonts**: Outfit (display), Plus Jakarta Sans (body)

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` - Database ORM and migration tooling
- `express` + `express-session` - HTTP server and session management
- `passport` - Authentication middleware
- `openid-client` - OIDC client for Replit Auth
- `connect-pg-simple` - PostgreSQL session store
- `zod` - Runtime validation
- `framer-motion` - Animations
- `recharts` - Dashboard charts
- `embla-carousel-react` - Image carousel
- `react-hook-form` - Form management