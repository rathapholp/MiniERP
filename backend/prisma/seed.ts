import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: { email: 'admin@demo.com', password: hash, name: 'Admin', role: 'ADMIN' },
  });

  // Categories
  const cat1 = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });
  const cat2 = await prisma.category.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: { name: 'Office Supplies' },
  });

  // Expense categories
  for (const name of ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Travel', 'Other']) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Products
  await prisma.product.upsert({
    where: { code: 'PRD-001' },
    update: {},
    create: {
      code: 'PRD-001',
      name: 'Laptop 15"',
      unit: 'pcs',
      costPrice: 25000,
      sellPrice: 35000,
      vatRate: 7,
      stockQty: 10,
      categoryId: cat1.id,
    },
  });
  await prisma.product.upsert({
    where: { code: 'PRD-002' },
    update: {},
    create: {
      code: 'PRD-002',
      name: 'Wireless Mouse',
      unit: 'pcs',
      costPrice: 300,
      sellPrice: 599,
      vatRate: 7,
      stockQty: 50,
      categoryId: cat1.id,
    },
  });
  await prisma.product.upsert({
    where: { code: 'PRD-003' },
    update: {},
    create: {
      code: 'PRD-003',
      name: 'A4 Paper (500 sheets)',
      unit: 'ream',
      costPrice: 80,
      sellPrice: 120,
      vatRate: 7,
      stockQty: 200,
      categoryId: cat2.id,
    },
  });

  // Contacts
  await prisma.contact.upsert({
    where: { code: 'CUST-001' },
    update: {},
    create: {
      code: 'CUST-001',
      name: 'ABC Company Ltd.',
      taxId: '0105537123456',
      type: 'CUSTOMER',
      email: 'purchase@abc.com',
      phone: '02-123-4567',
      address: '123 Sukhumvit Rd, Bangkok 10110',
    },
  });
  await prisma.contact.upsert({
    where: { code: 'CUST-002' },
    update: {},
    create: {
      code: 'CUST-002',
      name: 'XYZ Trading Co.',
      taxId: '0105538654321',
      type: 'CUSTOMER',
      email: 'accounting@xyz.com',
      phone: '02-987-6543',
      address: '456 Silom Rd, Bangkok 10500',
    },
  });
  await prisma.contact.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      code: 'SUP-001',
      name: 'Tech Distributor Co.',
      taxId: '0115537111222',
      type: 'SUPPLIER',
      email: 'sales@techdist.com',
      phone: '02-555-0100',
      address: '789 Ratchada Rd, Bangkok 10400',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
