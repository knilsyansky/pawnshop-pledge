import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path from 'path';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

console.log('__dirname:', __dirname);

const envPath = path.resolve(__dirname, '../../../', envFile);

console.log('env path:', envPath);

dotenv.config({ path: envPath });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  await app.listen(3000);
}
bootstrap();
