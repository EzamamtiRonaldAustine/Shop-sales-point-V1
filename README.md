# DailySales — Full Stack Sales & Budgeting Web Application
By [Ezamamti Ronald Austine]

> A full stack web application for small business owners to log daily sales, track investment costs, monitor profit and loss, and gain analytics insights on their goods and inventory.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [Project Structure](#6-project-structure)
7. [Environment Variables](#7-environment-variables)
8. [Getting Started](#8-getting-started)
9. [API Reference](#9-api-reference)
10. [Build Phases & Roadmap](#10-build-phases--roadmap)
11. [Deployment Guide](#11-deployment-guide)
12. [Free Tier Limits & Considerations](#12-free-tier-limits--considerations)
13. [Tools & Services Summary](#13-tools--services-summary)
14. [Contributing](#14-contributing)
15. [License](#15-license)

---

## 1. Project Overview

**DailySales** is a full stack web application built with **Next.js 16** (App Router), **PostgreSQL** via **Neon**, and deployed on **Vercel**. It is designed for small business owners — market traders, shop owners, or sole traders — who need a simple, reliable system to:

- Record goods they stock and sell (by piece, kilogram, or litre)
- Log daily sales transactions with quantities and revenue
- Track investment/restocking costs per good
- Calculate daily, weekly, and monthly profit or loss
- Visualise analytics: top-selling goods, slow-moving stock, profit trends, and best-performing days

The application is **free to build and deploy** using the free tiers of Vercel, Neon, and GitHub with no credit card required for development and early production use.

---

## 2. Features

### Goods & Inventory Management
- Add, edit, and delete goods
- Assign unit types per good: `piece`, `kilogram`, or `litre`
- Set cost price (what you pay) and selling price (what you charge) per unit
- View the full goods catalogue with current margins

### Daily Sales Entry
- Log sales for any date — select a good, enter quantity sold
- Revenue is auto-calculated from quantity × selling price
- Edit or delete individual sale entries
- View all sales for a given day on one screen

### Investment / Cost Tracking
- Record restocking or investment costs linked to a specific good
- Or log general daily operating costs not tied to a specific good
- Track total spend per good over time

### Profit & Loss Dashboard
- Daily summary: total revenue, total costs, net profit or loss
- Browse by date using a date picker
- Visual indicator: green for profit, red for loss
- Weekly and monthly roll-up views

### Analytics
- Top 5 best-selling goods by quantity and by revenue
- Slowest-moving goods (flagged for review)
- Profit trend chart over 30 / 90 days
- Best-performing day of the week
- Goods with the highest margin vs goods sold at a loss

### Authentication
- User registration and login (email + password)
- Optional Google OAuth sign-in
- Session-based auth — each user sees only their own data
- Protected routes via Next.js middleware

---

## 3. Tech Stack

### Frontend

| Tool | Purpose | Why |
|---|---|---|
| **Next.js 16** (App Router) | Framework | Server components, server actions, API routes, file-based routing |
| **React 19** | UI library | Component model, hooks, concurrent features |
| **Tailwind CSS** | Styling | Utility-first, zero config with Next.js, responsive by default |
| **Recharts** | Data visualisation | Composable charts, works well with React, lightweight |
| **React Hook Form** | Form state management | Performant, minimal re-renders, easy validation integration |
| **Zod** | Schema validation | Runtime type safety for form inputs and API payloads |
| **date-fns** | Date utilities | Lightweight date formatting and arithmetic |

### Backend

| Tool | Purpose | Why |
|---|---|---|
| **Next.js API Routes** | REST API | Co-located with frontend, no separate server needed |
| **Prisma ORM** | Database access | Type-safe queries, auto-generated types, migrations built in |
| **NextAuth.js (Auth.js v5)** | Authentication | Purpose-built for Next.js, supports credentials + OAuth |
| **bcryptjs** | Password hashing | Secure credential storage |

### Database

| Tool | Purpose | Why |
|---|---|---|
| **PostgreSQL** | Relational database | ACID compliance, relational integrity, excellent for financial data |
| **Neon** | Managed PostgreSQL hosting | Best free PostgreSQL tier in 2026 — 0.5 GB storage, serverless, scales to zero |

### DevOps & Tooling

| Tool | Purpose | Why |
|---|---|---|
| **GitHub** | Version control | Free, industry standard, integrates with Vercel for CI/CD |
| **Vercel** | Hosting & deployment | Purpose-built for Next.js, auto-deploy on push, free hobby tier |
| **Postman** | API testing | Test all API routes during development before wiring to UI |
| **TypeScript** | Language | Type safety across the full stack, catches errors at compile time |
| **ESLint** | Linting | Enforces code quality rules, included with Next.js setup |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client (Browser)                    │
│         React · Tailwind CSS · Recharts              │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / React Server Components
┌────────────────────────▼────────────────────────────┐
│            Next.js 16 App Router (Vercel)            │
│   Server Components · Server Actions · Middleware    │
│                                                      │
│  ┌──────────────┐ ┌───────────────┐ ┌─────────────┐ │
│  │ /api/goods   │ │  /api/sales   │ │/api/analytics│ │
│  │ CRUD · units │ │ Daily logs    │ │ Trends · Top │ │
│  └──────┬───────┘ └───────┬───────┘ └──────┬──────┘ │
└─────────┼─────────────────┼────────────────┼────────┘
          │                 │                │
┌─────────▼─────────────────▼────────────────▼────────┐
│                    Prisma ORM                        │
│         Type-safe queries · Migrations               │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              PostgreSQL — Neon (free tier)            │
│    users · goods · sale_entries · investment_logs    │
└─────────────────────────────────────────────────────┘

Dev Pipeline:
  GitHub ──push──▶ Vercel CI ──build──▶ Production URL
  Postman ◀────── /api/* routes ───────────────────────
```

---

## 5. Database Schema

The following is the full Prisma schema. Save this as `prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String           @id @default(cuid())
  name           String?
  email          String           @unique
  passwordHash   String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  goods          Good[]
  saleEntries    SaleEntry[]
  investmentLogs InvestmentLog[]

  @@map("users")
}

model Good {
  id            String    @id @default(cuid())
  name          String
  unitType      UnitType  @default(PIECE)
  costPrice     Decimal   @db.Decimal(10, 2)
  sellingPrice  Decimal   @db.Decimal(10, 2)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  saleEntries    SaleEntry[]
  investmentLogs InvestmentLog[]

  @@map("goods")
}

enum UnitType {
  PIECE
  KILOGRAM
  LITRE
}

model SaleEntry {
  id           String   @id @default(cuid())
  quantity     Decimal  @db.Decimal(10, 3)
  totalRevenue Decimal  @db.Decimal(10, 2)
  saleDate     DateTime @db.Date
  note         String?
  createdAt    DateTime @default(now())

  goodId  String
  good    Good   @relation(fields: [goodId], references: [id], onDelete: Cascade)

  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sale_entries")
}

model InvestmentLog {
  id          String   @id @default(cuid())
  amountSpent Decimal  @db.Decimal(10, 2)
  note        String?
  date        DateTime @db.Date
  createdAt   DateTime @default(now())

  goodId  String?
  good    Good?   @relation(fields: [goodId], references: [id], onDelete: SetNull)

  userId  String
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("investment_logs")
}
```

### Key relationships

- One **User** has many **Goods**, **SaleEntries**, and **InvestmentLogs**
- One **Good** has many **SaleEntries** and **InvestmentLogs**
- **InvestmentLog.goodId** is nullable — costs can be general (not tied to a specific good)
- Profit formula: `SUM(sale_entries.total_revenue) - SUM(investment_logs.amount_spent)` filtered by date and user

---

## 6. Project Structure

```
sales-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   └── register/
│   │       └── page.tsx               # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Dashboard shell with nav sidebar
│   │   ├── page.tsx                   # Home: today's P&L summary
│   │   ├── goods/
│   │   │   ├── page.tsx               # Goods catalogue list
│   │   │   ├── new/page.tsx           # Add a new good
│   │   │   └── [id]/edit/page.tsx     # Edit an existing good
│   │   ├── sales/
│   │   │   ├── page.tsx               # Log today's sales
│   │   │   └── [date]/page.tsx        # View sales for a specific date
│   │   ├── investments/
│   │   │   └── page.tsx               # Log investment / restocking costs
│   │   └── analytics/
│   │       └── page.tsx               # Charts and insights
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts # NextAuth handler
│   │   ├── goods/
│   │   │   ├── route.ts               # GET (list), POST (create)
│   │   │   └── [id]/route.ts          # GET (one), PUT (update), DELETE
│   │   ├── sales/
│   │   │   ├── route.ts               # GET (by date), POST (create)
│   │   │   └── [id]/route.ts          # PUT, DELETE
│   │   ├── investments/
│   │   │   ├── route.ts               # GET, POST
│   │   │   └── [id]/route.ts          # PUT, DELETE
│   │   └── analytics/
│   │       └── route.ts               # GET summary data for charts
│   ├── globals.css
│   └── layout.tsx                     # Root layout with providers
│
├── components/
│   ├── ui/                            # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   └── DatePicker.tsx
│   ├── GoodForm.tsx                   # Add / edit good form
│   ├── SaleEntryForm.tsx              # Log a sale entry
│   ├── InvestmentForm.tsx             # Log an investment cost
│   ├── DailySummaryCard.tsx           # Revenue / cost / profit card
│   ├── SalesChart.tsx                 # Recharts line chart
│   ├── TopGoodsChart.tsx              # Recharts bar chart
│   └── Navbar.tsx                     # Dashboard navigation
│
├── lib/
│   ├── db.ts                          # Prisma client singleton
│   ├── auth.ts                        # NextAuth configuration
│   ├── validations.ts                 # Zod schemas for all forms
│   └── utils.ts                       # formatCurrency, calcProfit, etc.
│
├── types/
│   └── index.ts                       # Shared TypeScript interfaces
│
├── prisma/
│   ├── schema.prisma                  # Database schema (see above)
│   └── migrations/                    # Auto-generated migration files
│
├── middleware.ts                      # Protect dashboard routes
├── .env.local                         # Local secrets — never commit
├── .env.example                       # Template for teammates
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── README.md
```

---

## 7. Environment Variables

Create a `.env.local` file in the project root. **Never commit this file to GitHub.**

```bash
# Database — get this from your Neon project dashboard
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-string-here"

# Local development URL
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional — only if enabling Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Copy `.env.local` to `.env.example` and blank out all the values before committing. Add all the same variables to **Vercel → Settings → Environment Variables** before deploying.

---

## 8. Getting Started

### Prerequisites

- Node.js 20 or later
- npm 9 or later
- A [Neon](https://neon.tech) account (free)
- A [GitHub](https://github.com) account (free)
- A [Vercel](https://vercel.com) account (free)

### Local setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sales-app.git
cd sales-app

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Then open .env.local and fill in your DATABASE_URL and NEXTAUTH_SECRET

# 4. Push the schema to your Neon database
npx prisma migrate dev --name init

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful development commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Run production build locally
npm run lint         # Run ESLint

npx prisma studio    # Open visual DB browser at localhost:5555
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma migrate reset               # Reset DB (WARNING: deletes all data)
npx prisma db push                     # Push schema changes without a migration file
```

---

## 9. API Reference

All endpoints are under `/api`. All routes require an authenticated session except auth routes.

### Goods

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/goods` | List all goods for current user | — |
| `POST` | `/api/goods` | Create a new good | `{ name, unitType, costPrice, sellingPrice }` |
| `GET` | `/api/goods/:id` | Get a single good | — |
| `PUT` | `/api/goods/:id` | Update a good | `{ name?, unitType?, costPrice?, sellingPrice? }` |
| `DELETE` | `/api/goods/:id` | Delete a good | — |

### Sales

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/sales?date=YYYY-MM-DD` | List sales for a date | — |
| `POST` | `/api/sales` | Log a new sale entry | `{ goodId, quantity, saleDate, note? }` |
| `PUT` | `/api/sales/:id` | Update a sale entry | `{ quantity?, note? }` |
| `DELETE` | `/api/sales/:id` | Delete a sale entry | — |

### Investments

| Method | Endpoint | Description | Body |
|---|---|---|---|
| `GET` | `/api/investments?date=YYYY-MM-DD` | List investment logs for a date | — |
| `POST` | `/api/investments` | Log an investment cost | `{ amountSpent, date, goodId?, note? }` |
| `PUT` | `/api/investments/:id` | Update an investment log | `{ amountSpent?, note? }` |
| `DELETE` | `/api/investments/:id` | Delete an investment log | — |

### Analytics

| Method | Endpoint | Description | Query params |
|---|---|---|---|
| `GET` | `/api/analytics` | Full analytics summary | `?period=30d\|90d\|all` |

**Analytics response shape:**
```json
{
  "topSellingByQuantity": [{ "goodId": "", "goodName": "", "totalQty": 0 }],
  "topSellingByRevenue":  [{ "goodId": "", "goodName": "", "totalRevenue": 0 }],
  "slowestMoving":        [{ "goodId": "", "goodName": "", "totalQty": 0 }],
  "profitByDay":          [{ "date": "YYYY-MM-DD", "revenue": 0, "costs": 0, "profit": 0 }],
  "bestDayOfWeek":        "Monday",
  "totalRevenue":         0,
  "totalCosts":           0,
  "netProfit":            0
}
```

---

## 10. Build Phases & Roadmap

### Phase 1 — Project setup (Day 1)
- Initialise Next.js 16 with TypeScript and Tailwind CSS
- Create GitHub repository and push initial commit
- Create Neon database and obtain `DATABASE_URL`
- Install Prisma, write `schema.prisma`, run first migration
- Install and configure NextAuth with credentials provider

**Deliverable:** App runs locally, database is connected, first migration applied.

---

### Phase 2 — Authentication (Day 2)
- Build `/login` and `/register` pages with React Hook Form + Zod
- Implement `POST /api/auth/register` endpoint with bcrypt password hashing
- Configure `middleware.ts` to protect all `/dashboard` routes
- Test login flow end-to-end with Postman

**Deliverable:** Users can register, log in, and be redirected to a protected dashboard.

---

### Phase 3 — Goods management (Day 3–4)
- Build goods API routes: `GET`, `POST`, `PUT`, `DELETE` under `/api/goods`
- Build goods catalogue page: list all goods with unit type badge and margin display
- Build "add good" form with unit type selector (piece / kg / litre)
- Build "edit good" page

**Deliverable:** Users can create and manage their goods catalogue.

---

### Phase 4 — Daily sales entry (Day 5–6)
- Build sales API routes under `/api/sales`
- Build sales entry page: select good from dropdown, enter quantity, auto-show revenue
- Display all sales for the selected day in a table below the form
- Allow editing and deleting individual entries

**Deliverable:** Users can log what they sold each day and see revenue per entry.

---

### Phase 5 — Investment & cost tracking (Day 7)
- Build investment API routes under `/api/investments`
- Build investment log form: select good (optional), enter amount spent and date
- Display investment logs alongside daily sales summary

**Deliverable:** Users can log restocking and operating costs.

---

### Phase 6 — Profit & Loss dashboard (Day 8–9)
- Build the main dashboard page (`/dashboard`)
- Show daily summary card: total revenue, total costs, net profit/loss with colour coding
- Add date picker to browse any historical date
- Add weekly and monthly roll-up calculations

**Deliverable:** Users see their P&L at a glance for any date.

---

### Phase 7 — Analytics (Day 10–11)
- Build `/api/analytics` endpoint with all aggregate queries
- Build analytics page with:
  - Bar chart: top 5 goods by quantity sold
  - Bar chart: top 5 goods by revenue
  - Line chart: daily profit/loss trend over 30 days
  - Table: slowest-moving goods
  - Stat cards: best day of week, total net profit for period

**Deliverable:** Users can identify their best and worst performers with visual charts.

---

### Phase 8 — Deploy & harden (Day 12–14)
- Review all API routes for missing auth checks
- Add input sanitisation and error handling to all endpoints
- Write `.env.example` with all variable names
- Push final code to GitHub
- Connect repo to Vercel and configure environment variables
- Run `npx prisma migrate deploy` against production Neon database
- Test all routes with Postman against the production URL
- Register a real user and complete an end-to-end test

**Deliverable:** Application is live on Vercel, production database is migrated, fully tested.

---

## 11. Deployment Guide

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/sales-app.git
git push -u origin main
```

### Step 2 — Create Neon database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **connection string** from the dashboard (it starts with `postgresql://`)
4. Paste it as `DATABASE_URL` in your environment variables

### Step 3 — Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** and import your GitHub repository
3. Before deploying, go to **Settings → Environment Variables** and add all variables from your `.env.local`
4. Click **Deploy**

### Step 4 — Run database migrations on production

After the first deploy, run migrations against your Neon production database:

```bash
# Set DATABASE_URL to your production Neon URL temporarily, then:
npx prisma migrate deploy
```

Or add this to your Vercel build command: `npx prisma migrate deploy && next build`

### Step 5 — Verify

- Visit your Vercel URL and register a user
- Add a good, log a sale, and confirm data appears in Neon (use Prisma Studio locally pointing at the prod DB to inspect)
- Test all API routes with Postman using the production base URL

---

## 12. Free Tier Limits & Considerations

| Service | Free limit | Risk | Mitigation |
|---|---|---|---|
| **Vercel** | Unlimited deployments, 100 GB bandwidth/mo | Project paused if limits exceeded | Monitor in Vercel dashboard; upgrade to Pro ($20/mo) if needed |
| **Neon** | 0.5 GB storage, 100 compute-hours/mo | DB suspends after idle period | Scales to zero automatically; resumes on next request (cold start ~1s) |
| **GitHub** | Unlimited public & private repos | None | — |
| **NextAuth** | Free, open source | None | — |

> **Recommendation:** For a single-user or small-team deployment, the free tiers of Vercel and Neon are more than sufficient. If you scale to hundreds of daily active users, upgrade Neon to the Launch plan ($19/mo) and Vercel to Pro ($20/mo).

---

## 13. Tools & Services Summary

| Tool | Category | Cost | Link |
|---|---|---|---|
| Next.js 16 | Framework | Free / open source | nextjs.org |
| React 19 | UI library | Free / open source | react.dev |
| Tailwind CSS | Styling | Free / open source | tailwindcss.com |
| Prisma | ORM | Free / open source | prisma.io |
| NextAuth.js | Auth | Free / open source | authjs.dev |
| Recharts | Charts | Free / open source | recharts.org |
| React Hook Form | Forms | Free / open source | react-hook-form.com |
| Zod | Validation | Free / open source | zod.dev |
| date-fns | Date utils | Free / open source | date-fns.io |
| Neon | PostgreSQL hosting | Free tier available | neon.tech |
| Vercel | App hosting | Free tier available | vercel.com |
| GitHub | Version control | Free | github.com |
| Postman | API testing | Free | postman.com |
| TypeScript | Language | Free / open source | typescriptlang.org |

---

## 14. Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

### Commit message convention

Use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add weekly profit roll-up to dashboard
fix: correct quantity calculation for kilogram units
chore: update Prisma to v6
docs: add API reference to README
```

---

## 15. License

This project is licensed under the **MIT License**. See `LICENSE` for details.

---

*Built with Next.js 16, Prisma, PostgreSQL (Neon), and deployed on Vercel.*