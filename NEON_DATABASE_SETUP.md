# Neon Database Setup Guide

This guide explains how to connect **DailySales** to a Neon Serverless PostgreSQL database for both local development and production deployment on Vercel.

---

## 1. Create a Neon Account and Project

1. Go to [neon.tech](https://neon.tech/) and sign up or log in (free — no credit card required).
2. Click **New Project** and give it a name (e.g., `dailysales-prod`).
3. Select your preferred region (choose the one closest to your Vercel deployment region for lowest latency).

---

## 2. Obtain Your Connection Strings

Once your project is created, navigate to the **Connection Details** panel on your Neon dashboard.

You will see two types of connection strings:

| Type | When to use |
|---|---|
| **Direct** (no `-pooler` in host) | Local development, `prisma migrate dev`, `prisma db push` |
| **Pooled** (`-pooler` in host) | Vercel Edge/Serverless production requests |

> **Critical:** The Prisma schema push commands (`prisma db push`, `prisma migrate deploy`) **must** use the **direct** connection string. Using the pooled URL causes a `P1001: Can't reach database server` error during the build step.

Both URLs follow this pattern:
```
postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

---

## 3. Configure Environment Variables

### Local Development (`.env.local`)

Create a `.env.local` file in the project root if it does not already exist (you can copy `.env.example`):

```env
# Direct connection — required for Prisma CLI commands locally
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

> **Never commit `.env.local` to Git.** It is already listed in `.gitignore`.

### Vercel Production

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | The **direct** Neon connection string (not the pooler URL) |
| `NEXTAUTH_SECRET` | A strong random secret (generate with `openssl rand -base64 32`) |

---

## 4. Run Prisma Schema Push

### First-time local setup

After setting your `DATABASE_URL`, push the schema to your Neon database:

```bash
npx prisma db push
```

This will create all tables (`users`, `goods`, `sale_entries`, `investment_logs`, `login_sessions`) in your Neon database.

If you prefer to track your schema history with migration files, use this instead:

```bash
npx prisma migrate dev --name init
```

> **Important:** `migrate dev` must use the **direct** connection string, not the pooled `-pooler` URL. If Prisma reports schema drift on first-time setup, it usually means the database already has tables from a previous attempt. For a fresh database with no data to preserve, run `npx prisma migrate reset`. To preserve existing data, use `npx prisma db push` or create a baseline migration.

### Vercel (production) — automatic

The `package.json` build script is pre-configured to automatically push schema changes to your Neon database on every Vercel deployment:

```json
"build": "prisma generate && prisma db push --accept-data-loss && next build"
```

This means you **do not** need to manually run migrations after deploying. Every `git push` to `main` will:
1. Generate the Prisma Client
2. Push the latest schema to your Neon database
3. Build the Next.js application

---

## 5. Generate the Prisma Client

When developing locally, ensure the Prisma Client is up to date after any schema change:

```bash
npx prisma generate
```

This is run automatically as part of `npm install` (via the `postinstall` script) and as part of the build command.

---

## 6. Useful Prisma Commands

```bash
npx prisma studio          # Open a visual database browser at localhost:5555
npx prisma db push         # Push schema changes without creating a migration file
npx prisma migrate dev     # Create a migration file and apply it (requires direct URL)
npx prisma migrate reset   # Drop and recreate the database (WARNING: deletes all data)
npx prisma generate        # Regenerate the Prisma Client after schema changes
```

---

Your application is now connected to Neon. Visit [http://localhost:3000](http://localhost:3000) and register your first user to get started.
