import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be defined in apps/backend/.env or the current environment');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

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
      id: 'Смартфоны',
      specification: {
        "Модель": 'string',
        "Память": 'integer',
        "Состояние экрана": 'enum'
      }
    },
    {
      id: 'Мониторы',
      specification: {
        "Диагональ": 'integer',
        "Разрешение": 'string',
        "Царапины": 'boolean'
      }
    },
    {
      id: 'Украшения',
      specification: {
        "Материал": 'string',
        "Вес": 'decimal',
        "Состояние": 'enum'
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
