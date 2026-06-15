const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin_1@gmail.com";
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("admin1234", 10);
    
    await prisma.user.create({
      data: {
        name: "Mr Ron",
        email,
        passwordHash,
        role: "SUPER_ADMIN",
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
