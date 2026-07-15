import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  const tariffs = [
    {
      id: 'Техника 5 дней 2.158%',
      basePeriodDays: 5,
      basePeriodRate: '2.158',
      overdueRate: '0.50',
      overduePeriodDays: 7
    },
    {
      id: 'Экспресс 2 дня 4.25%',
      basePeriodDays: 2,
      basePeriodRate: '4.25',
      overdueRate: '0.65',
      overduePeriodDays: 5
    }
  ];

  const categories = [
    {
      id: 'Smartphone',
      specification: {
        model: 'string',
        memory: 'string',
        screenCondition: 'string'
      }
    },
    {
      id: 'Monitor',
      specification: {
        diagonal: 'string',
        resolution: 'string',
        scratches: 'string'
      }
    },
    {
      id: 'Jewelry',
      specification: {
        material: 'string',
        weight: 'string',
        condition: 'string'
      }
    }
  ];

  await prisma.tariff.createMany({ data: tariffs, skipDuplicates: true });
  await prisma.itemCategory.createMany({ data: categories, skipDuplicates: true });

  console.log('Seeded tariffs and item categories.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
