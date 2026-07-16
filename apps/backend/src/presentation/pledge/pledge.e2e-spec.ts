import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppModule } from '../../app.module';

const testTariffs = [
  {
    id: 'Техника 5 дней 2.158%',
    basePeriodDays: 5,
    basePeriodRate: '2.158',
    overdueRate: '0.50',
    overduePeriodDays: 7
  }
];

const testCategories = [
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
  }
];

describe('Pledge e2e', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });

    await prisma.pledgeItem.deleteMany();
    await prisma.pledge.deleteMany();
    await prisma.client.deleteMany();
    await prisma.itemCategory.deleteMany();
    await prisma.tariff.deleteMany();

    await prisma.tariff.createMany({ data: testTariffs });
    await prisma.itemCategory.createMany({ data: testCategories });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('creates a pledge and calculates due date and amount', async () => {
    const client = await prisma.client.create({
      data: { fullName: 'E2E Client', phone: `e2e-${Date.now()}@test.local` }
    });

    const response = await request(app.getHttpServer())
      .post('/pledges')
      .send({
        clientId: client.id,
        tariffId: 'Техника 5 дней 2.158%',
        items: [
          {
            categoryId: 'Smartphone',
            name: 'Pixel 8',
            estimatedValue: 200.10,
            specifications: { model: 'Pixel 8', memory: '128GB', screenCondition: 'Good' }
          },
          {
            categoryId: 'Monitor',
            name: 'Dell 24',
            estimatedValue: 150,
            specifications: { diagonal: '24', resolution: '1920x1080', scratches: 'None' }
          }
        ]
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('clientId', client.id);
    expect(response.body).toHaveProperty('tariffId', 'Техника 5 дней 2.158%');
    expect(response.body).toHaveProperty('amount', '350.10');
    expect(response.body).toHaveProperty('dueDate');

    const dueDate = new Date(response.body.dueDate);
    const createdAt = new Date(response.body.createdAt);
    const diffDays = Math.round((dueDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(5);
  });

  it('redeems an active pledge and calculates redemption amount', async () => {
    const client = await prisma.client.create({
      data: { fullName: 'E2E Redeem', phone: `e2e-redeem-${Date.now()}@test.local` }
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const pledge = await prisma.pledge.create({
      data: {
        clientId: client.id,
        tariffId: 'Техника 5 дней 2.158%',
        createdAt: new Date(),
        dueDate,
        amount: '100.00',
        status: 'ACTIVE',
        items: {
          create: [
            {
              categoryId: 'Smartphone',
              name: 'Old Phone',
              estimatedValue: '100.00',
              specifications: { model: 'Old Phone', memory: '64GB', screenCondition: 'Fair' }
            }
          ]
        }
      }
    });

    const response = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', pledge.id);
    expect(response.body).toHaveProperty('status', 'REDEEMED');
    expect(response.body).toHaveProperty('redeemedAmount');
    expect(response.body).toHaveProperty('redeemedAt');
    expect(response.body.redeemedAmount).toBe('102.16');
  });
});
