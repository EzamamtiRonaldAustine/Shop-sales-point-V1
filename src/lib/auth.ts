import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * NextAuth Configuration
 * 
 * Defines the authentication strategy, providers, and callbacks.
 * We use a JWT strategy and a Credentials provider since users log in with email/password.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
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

        // Fetch user from DB, ignoring soft-deleted users
        const user = await db.user.findUnique({
          where: { email, deletedAt: null },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordsMatch) {
          // Extract the client IP address from request headers for the audit log
          const ipAddress =
            request?.headers?.get?.("x-forwarded-for") ??
            request?.headers?.get?.("x-real-ip") ??
            null;

          // Record a new login session for auditing purposes (useful for Super Admin Panel)
          await db.loginSession.create({
            data: { userId: user.id, ipAddress },
          });

          // Return the user object to be passed into the JWT callback
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
  callbacks: {
    /**
     * JWT Callback: Responsible for constructing the token payload.
     * This token is stored in the user's browser cookie.
     */
    async jwt({ token, user, trigger, session }) {
      // Upon initial sign-in, the 'user' object is populated from the authorize callback.
      // We embed custom RBAC and security flags directly into the JWT token.
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.requiresPasswordChange = (user as any).requiresPasswordChange;
      }
      
      // Handle mid-session updates (e.g., when a user changes their default password)
      // The update trigger allows the client to explicitly update properties on the JWT.
      if (trigger === "update" && session?.requiresPasswordChange !== undefined) {
        token.requiresPasswordChange = session.requiresPasswordChange;
      }
      return token;
    },
    
    /**
     * Session Callback: Exposes data from the JWT token to the client-side session object.
     * This ensures the frontend has immediate access to the user's ID, role, and password status
     * without needing a separate API call.
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
});
