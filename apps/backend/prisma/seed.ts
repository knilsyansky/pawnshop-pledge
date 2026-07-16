import path from 'path';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../../../', envFile) });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be defined in apps/backend/.env or the current environment');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function seedDemoData() {
    const tariff = await prisma.tariff.findUnique({
        where: {
            id: 'Техника 5 дней 2.158%',
        },
    });

    if (!tariff) {
        throw new Error('Техника 5 дней 2.158% tariff not found. Run tariff seed first.');
    }

    const smartphoneCategory = await prisma.itemCategory.findUnique({
        where: {
            id: 'Смартфоны',
        },
    });

    const monitorCategory = await prisma.itemCategory.findUnique({
        where: {
            id: 'Мониторы',
        },
    });

    if (!smartphoneCategory || !monitorCategory) {
        throw new Error('Required categories not found. Run category seed first.');
    }

    const client = await prisma.client.upsert({
        where: {
            phone: '+79990001122',
        },
        update: {
            fullName: 'Иван Иванов',
        },
        create: {
            fullName: 'Иван Иванов',
            phone: '+79990001122',
        },
    });


    const pledge = await prisma.pledge.upsert({
        where: {
        id: 1,
        },
        update: {},
        create: {
        clientId: client.id,
        tariffId: tariff.id,

        createdAt: new Date('2026-07-01'),
        dueDate: new Date('2026-07-06'),

        amount: '50000',

        status: 'ACTIVE',

        items: {
            create: [
            {
                name: 'iPhone 15 Pro',
                categoryId: smartphoneCategory.id,
                estimatedValue: '35000',

                specifications: {
                model: 'iPhone 15 Pro',
                memory: 256,
                screenCondition: 'good',
                },
            },
            {
                name: 'Samsung Monitor',
                categoryId: monitorCategory.id,
                estimatedValue: '15000',

                specifications: {
                model: 'Samsung Odyssey',
                diagonal: 27,
                resolution: '2560x1440',
                scratches: false,
                },
            },
            ],
        },
        },
        include: {
        items: true,
        },
    });


    console.log(
        `Created demo pledge ${pledge.id} for client ${client.fullName}`,
    );
}

async function main() {
  const tariffs = [
    {
      id: 'Техника 5 дней 2.158%',
      basePeriodDays: 5,
      basePeriodRate: new Prisma.Decimal('2.158'),
      overdueRate: new Prisma.Decimal('4.98'),
      overduePeriodDays: null
    },
    {
      id: 'Экспресс 2 дня 4.25%',
      basePeriodDays: 2,
      basePeriodRate: '4.25',
      overdueRate: '0.65',
      overduePeriodDays: null
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
        "Модель": 'string',
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
      }
    }
  ];

  await prisma.tariff.createMany({ data: tariffs, skipDuplicates: true });
  await prisma.itemCategory.createMany({ data: categories, skipDuplicates: true });

  seedDemoData()

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
