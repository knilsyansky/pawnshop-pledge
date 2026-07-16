import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppModule } from '../../app.module';

jest.setTimeout(10000);

const testTariffs = [
  {
    id: 'Long tariff',
    basePeriodDays: 10,
    basePeriodRate: '5.00',
    overdueRate: '1.00',
    overduePeriodDays: 7,
  },
  {
    id: 'Short tariff',
    basePeriodDays: 5,
    basePeriodRate: '2.158',
    overdueRate: '1.00',
    overduePeriodDays: 7,
  },
];

const testCategories = [
  {
    id: 'Smartphone',
    specification: {
      model: 'string',
      memory: 'string',
      screenCondition: 'string',
    },
  },
];

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

describe('Pledge redeem e2e', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    prisma = new PrismaClient({ adapter });

    await prisma.pledgeItem.deleteMany();
    await prisma.pledge.deleteMany();
    await prisma.client.deleteMany();
    await prisma.itemCategory.deleteMany();
    await prisma.tariff.deleteMany();

    await prisma.tariff.createMany({
      data: testTariffs,
    });

    await prisma.itemCategory.createMany({
      data: testCategories,
    });
  });


  beforeEach(async () => {
    await prisma.pledgeItem.deleteMany();
    await prisma.pledge.deleteMany();
    await prisma.client.deleteMany();
  });


  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });


  async function createClient(fullName: string) {
    return prisma.client.create({
      data: {
        fullName,
        phone: `+380${Date.now()}${Math.floor(Math.random() * 1000)}`,
      },
    });
  }


  async function createPledge(params: {
    clientId: number;
    tariffId: string;
    amount: string;
    createdAt: Date;
    dueDate: Date;
  }) {
    return prisma.pledge.create({
      data: {
        clientId: params.clientId,
        tariffId: params.tariffId,
        createdAt: params.createdAt,
        dueDate: params.dueDate,
        amount: params.amount,
        status: 'ACTIVE',

        items: {
          create: [
            {
              categoryId: testCategories[0].id,
              name: 'Test smartphone',
              estimatedValue: params.amount,
              specifications: {
                model: 'Test',
                memory: '128GB',
                screenCondition: 'Good',
              },
            },
          ],
        },
      },
    });
  }


  it('redeems within the base period and charges only base interest', async () => {
    const today = new Date();

    const client = await createClient(
      'Base period client'
    );

    const pledge = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[1].id,
      amount: '100.00',

      createdAt: addDays(today, -1),
      dueDate: addDays(today, 5),
    });


    const response = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(200);


    expect(response.body.status)
      .toBe('REDEEMED');

    expect(response.body.redeemedAmount)
      .toBe('102.16');


    const saved = await prisma.pledge.findUnique({
      where: {
        id: pledge.id,
      },
    });


    expect(saved?.status)
      .toBe('REDEEMED');

    expect(saved?.redeemedAmount?.toString())
      .toBe('102.16');
  });



  it('redeems exactly on due date without overdue interest', async () => {
    const today = new Date();

    const client = await createClient(
      'Boundary client'
    );


    const pledge = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[1].id,

      amount: '200.00',

      createdAt: addDays(today, -5),
      dueDate: today,
    });


    const response = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(200);


    expect(response.body.redeemedAmount)
      .toBe('204.32');
  });



  it('redeems with overdue and adds overdue interest per day', async () => {
    const today = new Date();

    const client = await createClient(
      'Overdue client'
    );


    const pledge = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[1].id,

      amount: '100.00',

      createdAt: addDays(today, -10),
      dueDate: addDays(today, -3),
    });


    const response = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(200);


    expect(response.body.redeemedAmount)
      .toBe('105.16');


    const saved = await prisma.pledge.findUnique({
      where: {
        id: pledge.id,
      },
    });


    expect(saved?.redeemedAmount?.toString())
      .toBe('105.16');
  });



  it('rejects redeeming an already redeemed pledge', async () => {
    const today = new Date();

    const client = await createClient(
      'Redeemed client'
    );


    const pledge = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[1].id,

      amount: '100.00',

      createdAt: addDays(today, -1),
      dueDate: addDays(today, 5),
    });


    await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(200);



    await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledge.id}`)
      .expect(404);
  });



  it('uses tariff values and produces different results for same amount', async () => {
    const today = new Date();

    const client = await createClient(
      'Tariff comparison client'
    );


    const pledgeShort = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[1].id,

      amount: '100.00',

      createdAt: addDays(today, -1),
      dueDate: addDays(today, 5),
    });



    const pledgeLong = await createPledge({
      clientId: client.id,
      tariffId: testTariffs[0].id,

      amount: '100.00',

      createdAt: addDays(today, -1),
      dueDate: addDays(today, 5),
    });



    const responseShort = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledgeShort.id}`)
      .expect(200);



    const responseLong = await request(app.getHttpServer())
      .patch(`/pledges/redeem/${pledgeLong.id}`)
      .expect(200);



    expect(responseShort.body.redeemedAmount)
      .toBe('102.16');


    expect(responseLong.body.redeemedAmount)
      .toBe('105.00');


    expect(responseShort.body.redeemedAmount)
      .not
      .toBe(responseLong.body.redeemedAmount);
  });

});