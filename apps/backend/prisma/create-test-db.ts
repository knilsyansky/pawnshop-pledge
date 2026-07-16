import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be defined in apps/backend/.env.test');
}

const url = new URL(connectionString);
const dbName = url.pathname.slice(1);
url.pathname = '/postgres';

async function main() {
  const client = new Client({ connectionString: url.toString() });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created test database ${dbName}`);
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log(`Test database ${dbName} already exists`);
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
