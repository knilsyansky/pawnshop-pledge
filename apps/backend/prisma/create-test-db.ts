import path from 'path';
import dotenv from 'dotenv';
import { Client } from 'pg';

const envFile = '.env.test';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL not defined');
}

const url = new URL(connectionString);
const dbName = url.pathname.slice(1);
url.pathname = '/postgres';

async function main() {
  const client = new Client({ connectionString: url.toString() });

  try {
    await client.connect();

    // SQL Injection protection
    if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) { 
        throw new Error('Invalid database name');
    }

    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created test database ${dbName}`);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '42P04') {
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
  process.exitCode = 1;
});
