# Neon Database Setup Guide

This guide explains how to connect your application to a Neon Serverless Postgres database.

## 1. Create a Neon Account and Project
1. Go to [Neon.tech](https://neon.tech/) and sign up or log in.
2. Create a new project.
3. Select your preferred region and compute size.

## 2. Get Your Connection String
1. Once your project is created, navigate to the **Dashboard**.
2. Under the **Connection Details** section, copy the **direct** PostgreSQL connection string for migrations.
   - If you pick the pooled or Prisma-flavoured URL, `npx prisma migrate dev` can fail with `P1001`.
   - Keep the actual secret value in `.env.local`, not in this guide.
3. Copy the provided `DATABASE_URL`. It should look something like this:
   `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

## What Prisma Means Here
Prisma is the database client/ORM used by this project. In this repo, it is already wired up in [prisma/schema.prisma](prisma/schema.prisma) and reads the `DATABASE_URL` from your `.env.local` file.

If you are setting up Neon for this project, you do not need to write Prisma code in Neon itself. You only need the connection string, then run Prisma commands locally.

## 3. Update Your Environment Variables
1. Open your `.env.local` file (or create one if it doesn't exist by copying `.env.example`).
2. Update the `DATABASE_URL` variable with the connection string you copied from Neon:
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```

## 4. Run Prisma Migrations
Now that your database is connected, you need to push the Prisma schema to your new Neon database. Run the following command in your terminal:

```bash
npx prisma db push
```
If you are tracking migrations, use this instead:

```bash
npx prisma migrate dev
```

Important: `migrate dev` should use the direct Neon connection string, not the pooled `-pooler` URL.

If Prisma reports drift on a first-time setup, that usually means the Neon database already has tables but this repo does not yet have matching migration files. For a brand-new database with no data to keep, create a fresh empty database or use `npx prisma migrate reset`. If you need to preserve data, do not reset the schema; use `npx prisma db push` or create a baseline migration instead.

## 5. Generate Prisma Client
Finally, ensure your Prisma client is up to date:

```bash
npx prisma generate
```

Your app is now successfully connected to the Neon database!
