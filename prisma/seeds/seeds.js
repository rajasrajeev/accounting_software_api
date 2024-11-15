const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const generatePasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}


async function main() {
  // Create states
  const state1 = await prisma.state.create({
    data: {
      name: 'Kerala',
      districts: {
        create: [
          {
            name: 'Trivandrum',
          },
          {
            name: 'Kollam',
          }
        ]
      },
    }
  });

  const state2 = await prisma.state.create({
    data: {
      name: 'Tamil Nadu',
      districts: {
        create: [
          {
            name: 'Chennai',
          },
          {
            name: 'Madras',
          }
        ]
      },
    }
  });
  const grade = await prisma.grade.createMany({
    data: [{
      name: 'Grade 1',
    },{
      name: 'Grade 2',
    },{
      name: 'Grade 3',
    }]
  });
  const category = await prisma.category.createMany({
    data: [{
      name: 'Cement',
    },{
      name: 'Steel',
    },{
      name: 'Brick',
    }]
  });
  const unit = await prisma.unit.createMany({
    data: [{
      name: 'Kg',
    },{
      name: 'Ton',
    },{
      name: 'Meter',
    }]
  });

  const vendorUser = await prisma.user.create({
    data: {
      username: 'vendor1@gmail.com',
      password: await generatePasswordHash('password123'),
      role: 'VENDOR',
    },
  });

  const contractorUser = await prisma.user.create({
    data: {
      username: 'contractor1@gmail.com',
      password: await generatePasswordHash('password123'),
      role: 'CONTRACTOR',
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      username: 'warehouse1@gmail.com',
      password: await generatePasswordHash('password123'),
      role: 'WAREHOUSE',
    },
  });

  const backendUser = await prisma.user.create({
    data: {
      username: 'backend1@gmail.com',
      password: await generatePasswordHash('password123'),
      role: 'BACKEND',
    },
  });

  // Seed specific user roles
  await prisma.vendor.create({
    data: {
      user_id: vendorUser.id,
      company_name: 'Vendor Company',
      phone: '1234567890',
      email: 'vendor1@gmail.com',
      address: '123 Vendor St.',
      pin: '123456',
      stateId: 1,
      districtId: 1,
      city: 'Vendor City',
      pan: 'PAN1234',
      gst: 'GST1234',
      licence: 'LIC1234',
      pan_no: 'PAN1234',
      gst_no: 'GST1234',
      licence_no: 'LIC1234',
      status: 'Approved',
    },
  });

  await prisma.contractor.create({
    data: {
      user_id: contractorUser.id,
      contractor_id: 'CON1234',
      name: 'Contractor Name',
      company_name: 'Contractor Company',
      phone: '0987654321',
      email: 'contractor1@gmail.com',
      licence: 'LIC5678',
      status: 'Approved',
    },
  });

  await prisma.warehouse.create({
    data: {
      user_id: warehouseUser.id,
      name: 'Warehouse Name',
      location: 'Warehouse Location',
      incharge_name: 'Incharge Name',
    },
  });

  await prisma.backend.create({
    data: {
      user_id: backendUser.id,
      name: 'Backend Name',
      email: 'backend1@gmail.com',
      phone: '1122334455',
    },
  });

  // console.log({ grade, category });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
