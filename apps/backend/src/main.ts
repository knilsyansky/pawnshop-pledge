import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path from 'path';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  await app.listen(3000);
}
bootstrap();
