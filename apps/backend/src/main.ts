import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path from 'path';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.resolve(__dirname, '../../../', envFile);

dotenv.config({ path: envPath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
