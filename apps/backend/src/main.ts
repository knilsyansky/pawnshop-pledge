import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  await app.listen(3000);
}
bootstrap();
