import { type Role } from "@prisma/client";
import { NextAuthConfig } from "next-auth";

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
