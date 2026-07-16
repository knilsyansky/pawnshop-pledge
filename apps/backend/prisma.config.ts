import path from 'path';
import dotenv from 'dotenv';
import "dotenv/config";
import { defineConfig } from 'prisma/config';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ 
    path: path.resolve(__dirname, envFile),
    override: true,
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
