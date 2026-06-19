/**
 * auth.config.ts — Edge-safe NextAuth configuration
 *
 * This file contains ONLY the configuration that is safe to run in the
 * Edge runtime (Vercel Middleware). It intentionally has NO imports of
 * Prisma, bcrypt, or any other Node.js-only library.
 *
 * By keeping providers: [] here, the Middleware bundle stays tiny (< 200 KB)
 * and passes Vercel's 1 MB Edge Function size limit.
 *
 * The full configuration (with the Credentials provider that uses Prisma
 * and bcrypt) lives in auth.ts and is only ever bundled into Node.js
 * server routes — never into the Edge Function.
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours — forces re-login after this period
  },
  pages: {
    signIn: "/login",
  },

  /**
   * Empty providers array for the edge config.
   * The Credentials provider (which needs bcrypt + Prisma) is added in
   * auth.ts, which is only ever imported by server-side code.
   */
  providers: [],

  callbacks: {
    /**
     * JWT Callback (edge-safe): Embeds custom claims into the token.
     * This runs on every JWT read/write, including in the proxy middleware.
     * No database access is needed here — the data is already in the token.
     */
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, copy custom fields from the authorize() result
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.requiresPasswordChange = (user as any).requiresPasswordChange;
      }

      // Support mid-session updates (e.g. after password change)
      if (trigger === "update" && session?.requiresPasswordChange !== undefined) {
        token.requiresPasswordChange = session.requiresPasswordChange;
      }

      return token;
    },

    /**
     * Session Callback (edge-safe): Projects JWT claims onto the session object.
     * Called when session() is used in Server Components or API routes.
     */
    async session({ session, token }) {
      if (token && typeof token.id === "string") {
        session.user.id = token.id;
      }
      if (token && typeof token.role === "string") {
        (session.user as any).role = token.role;
      }
      if (token && typeof token.requiresPasswordChange === "boolean") {
        (session.user as any).requiresPasswordChange = token.requiresPasswordChange;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
