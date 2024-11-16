const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();


async function main() {
    try {
        // Step 1: Create or find MainModule with the name "Settings"
        const mainModule = await prisma.mainModule.upsert({
          where: { name: 'Settings' },
          update: {},
          create: { name: 'Settings' },
        });
    
        console.log('MainModule:', mainModule);
    
        // Step 2: Create or find SubModule with the name "Mod" under "Settings"
        const subModule = await prisma.subModule.upsert({
          where: { name: 'Mod' },
          update: {},
          create: {
            name: 'Mod',
            main_module_id: mainModule.id,
          },
        });
    
        console.log('SubModule:', subModule);
    
        // Step 3: Define the permissions for "Mod"
        const permissions = ['Create Mod', 'Delete Mod', 'Edit Mod', 'View Mod'];
    
        // Step 4: Add permissions to the database
        for (const permission of permissions) {
          const createdPermission = await prisma.permission.upsert({
            where: { name: permission },
            update: {},
            create: {
              name: permission,
              route: `/mod/${permission.toLowerCase().replace(' ', '-')}`,
              sub_module_id: subModule.id,
            },
          });
    
          console.log('Permission:', createdPermission);
        }
    
        console.log('Seeding completed successfully!');
      } catch (error) {
        console.error('Error seeding permissions:', error);
      } finally {
        await prisma.$disconnect();
      }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
