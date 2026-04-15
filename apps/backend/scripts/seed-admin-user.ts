/**
 * Seed Admin User Script
 *
 * Adds an admin user to the database for testing
 *
 * Usage:
 *   npx ts-node scripts/seed-admin-user.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin already exists
  const existing = await prisma.consultant.findUnique({
    where: { email: 'admin@softwaremind.com' },
  });

  if (existing) {
    console.log('ℹ️  Admin user already exists:', existing.email);
    return;
  }

  // Create admin user
  const admin = await prisma.consultant.create({
    data: {
      externalId: 'admin-user',
      name: 'Admin User',
      email: 'admin@softwaremind.com',
      teamLeadId: null,
      teamLeadName: null,
      teamLeadEmail: null,
      etoBalance: 200,
      workingHoursPerPeriod: 88,
      paymentType: 'SALARY',
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('📋 Details:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    etoBalance: admin.etoBalance,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
