// This file sets up a PrismaClient instance for database interactions in a Next.js application. It uses a global variable to ensure that only one instance of PrismaClient is created during development, preventing issues with hot reloading. In production, it creates a new instance of PrismaClient without using the global variable. This approach helps manage database connections efficiently and avoids potential memory leaks during development.
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
