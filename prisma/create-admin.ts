import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const adminEmail = 'admin@poroma.com';
  const adminPhone = '+8801567890123';
  const adminPassword = 'admin123';
  const adminName = 'Administrator';

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: adminEmail }, { phone: adminPhone }],
    },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      phone: adminPhone,
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      is_admin: true,
    },
  });

  await prisma.timeline.create({
    data: { user_id: admin.id },
  });

  console.log('Admin user created successfully!');
  console.log('Phone:', adminPhone);
  console.log('Password:', adminPassword);

  await prisma.$disconnect();
}

createAdminUser().catch((e) => {
  console.error(e);
  process.exit(1);
});
