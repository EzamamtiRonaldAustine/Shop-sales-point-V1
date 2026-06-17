import { type Role } from "@prisma/client";
import { NextAuthConfig } from "next-auth";

/**
 * NextAuth Type Augmentation
 * 
 * We extend the built-in NextAuth types (User, Session, and JWT) to include 
 * our custom database fields. This ensures strict TypeScript inference across 
 * the application when accessing the user's role and password status.
 */
declare module "next-auth" {
  interface User {
    role?: Role;
    requiresPasswordChange?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      requiresPasswordChange?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    requiresPasswordChange?: boolean;
  }
}
