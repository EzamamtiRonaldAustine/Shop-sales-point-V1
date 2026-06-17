/**
 * Prisma Database Seed Script
 * 
 * This script is responsible for bootstrapping the database with essential initial data.
 * Specifically, it creates the default Super Admin account ("Mr Ron") which is required
 * to manage the system upon first deployment.
 * 
 * The account is created with a default password and the `requiresPasswordChange` flag 
 * set to true, enforcing a secure password reset immediately upon first login.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin_1@gmail.com";
  
  // Check if the default super admin user already exists to prevent duplicate entries
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    // Hash the default one-time password securely before storing
    const passwordHash = await bcrypt.hash("admin1234", 10);
    
    // Create the Super Admin user
    await prisma.user.create({
      data: {
        name: "Mr Ron",
        email,
        passwordHash,
        role: "SUPER_ADMIN",
        // Enforce the one-time password change policy
        requiresPasswordChange: true,
      },
    });
    console.log(`Seeded super admin: ${email}`);
  } else {
    console.log(`Super admin ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
