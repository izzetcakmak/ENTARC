// Database Seed Script
// Seeds initial data including test user

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);

  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  });

  // Create additional test user
  const testPassword = await bcrypt.hash('arcent2024', 12);

  await prisma.user.upsert({
    where: { email: 'test@arcent.io' },
    update: {},
    create: {
      email: 'test@arcent.io',
      name: 'Arcent User',
      password: testPassword,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
