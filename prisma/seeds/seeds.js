const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Admin Role
  const adminRole = await prisma.role.create({
    data: {
      title: 'Admin', // Replace with desired role title
    },
  });

  console.log("Admin role created:", adminRole);

  // Create Admin User
  const hashedPassword = await bcrypt.hash('password123', 10); // Replace with a secure password
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin', // Replace with desired admin username
      password: hashedPassword,
      role_id: adminRole.id,
      verified: true,
    },
  });

  console.log("Admin user created:", adminUser);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
