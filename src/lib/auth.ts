/**
 * auth.ts — Full NextAuth configuration (Node.js / Server only)
 *
 * This file extends the edge-safe authConfig with the Credentials provider,
 * which uses Prisma (for DB lookups) and bcrypt (for password hashing).
 * These are Node.js-only libraries and MUST NOT be imported in the proxy
 * middleware (Edge runtime).
 *
 * Import this file only from:
 *   - API routes (e.g. /api/auth/[...nextauth]/route.ts)
 *   - Server Components that need the session (e.g. layouts, pages)
 *   - Server Actions
 *
 * The proxy middleware imports auth.config.ts instead, keeping the Edge
 * Function bundle well under Vercel's 1 MB limit.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Spread the shared edge-safe config (session, pages, jwt/session callbacks)
  ...authConfig,

  // Add the Credentials provider — this is the only part that needs
  // Prisma and bcrypt, so it lives here and never reaches the Edge bundle.
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Fetch user from DB, ignoring soft-deleted accounts
        const user = await db.user.findUnique({
          where: { email, deletedAt: null },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordsMatch) {
          // Extract the client IP for the audit log
          const ipAddress =
            request?.headers?.get?.("x-forwarded-for") ??
            request?.headers?.get?.("x-real-ip") ??
            null;

          // Record a login session for the Super Admin audit panel
          await db.loginSession.create({
            data: { userId: user.id, ipAddress },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            requiresPasswordChange: user.requiresPasswordChange,
          };
        }

        return null;
      },
    }),
  ],
});

