# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Sisters' Mom Pastry** - an Order Management System built with Next.js 14, TypeScript, and Tailwind CSS. The application manages orders for a bakery business specializing in cookies, cinnamon rolls, muffins, sandwiches, mallows, loaves, and other baked goods.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm lint
```

## Architecture

### Next.js App Router Structure

The application uses Next.js 14's App Router with the following page structure:

- **Root (`/`)**: Redirects to `/login` (src/app/page.tsx:4)
- **`/login`**: Authentication page with username/password form
- **`/orders`**: Main orders list view with search, filtering, and order management
- **`/orders/new`**: Order creation form with product selection and quantity management
- **`/sales`**: Sales dashboard with metrics, filters, and trend visualization
- **`/production`**: Production view showing aggregated product quantities by category

### Database Schema (Supabase)

The application uses a PostgreSQL database hosted on Supabase. Connection is configured via environment variables in `.env.local`.

**Supabase Client**: Located at `src/lib/supabase.ts` - exports the configured client and TypeScript types for all tables.

**Products Table**:
- Stores bakery products with categories (Cookies, Cinnamon Rolls, Sandwich, Mallows, Muffins, Loaves, Others)
- Fields: id (uuid), name, category, price, unit_type ('pack' or 'piece'), pieces_per_pack, is_active
- Uses UUID v4 for primary keys

**Orders Table**:
- Tracks customer orders with payment and completion status
- Fields: id (uuid), customer_name, order_date, total_amount, is_paid, is_completed
- Includes automatic timestamp triggers for updated_at

**OrderItems Table**:
- Junction table linking orders to products
- Fields: id (uuid), order_id (FK), product_id (FK), quantity, unit_price, subtotal
- Cascade deletes when order is deleted

Schema files located in `supabase/schema.sql` and `supabase/seed.sql`.

**Setup Instructions**:
1. Run `supabase/schema.sql` in Supabase SQL Editor to create tables
2. Run `supabase/seed.sql` to populate initial products
3. Environment variables are already configured in `.env.local`

### UI/Styling Conventions

- **Color Palette**:
  - Primary background: `#FFF8F5` (light peachy beige)
  - Accent pink: `#FADBD8` (used for logo placeholders, focus rings)
  - Accent green: `#A9DFBF` (primary action buttons, paid status)
  - Secondary green: `#C8E6C9` (active filter buttons)
  - White cards with `rounded-2xl` for major sections

- **Component Patterns**:
  - Reusable components are defined inline within page files (e.g., `MetricCard`, `FilterButton` in sales/page.tsx)
  - Lucide React icons are used throughout (`lucide-react` package)
  - Forms use consistent styling: `border-2 border-gray-200 rounded-xl` with focus ring in `#FADBD8`

- **Layout Structure**:
  - All pages have a white header with sticky positioning
  - Logo placeholder (colored circle with "Logo" text) appears in top-right
  - Main content uses `p-6` padding on light background

### Current State

**Supabase Connection**: Configured and ready to use via `src/lib/supabase.ts`.

**Note**: The application pages currently use mock data. Database integration is pending. Key pages are UI scaffolding only:
- Login page has no authentication logic
- Orders page displays hardcoded mock orders (needs to fetch from Supabase)
- Sales dashboard shows static metrics (needs to calculate from real orders)
- Production view uses static data (needs to aggregate from real order items)
- Order form has no submission handler (needs to create orders in Supabase)

### Path Aliases

TypeScript is configured with `@/*` alias mapping to `./src/*` (tsconfig.json:20-22).

## Key Implementation Notes

- All pages are Server Components by default (Next.js 14 App Router)
- No client-side state management is implemented yet
- No API routes exist in the codebase
- Currency is displayed in Philippine Peso (₱) format
- Product categories: Cookies, Cinnamon Rolls, Sandwich, Mallows, Muffins, Loaves, Others
