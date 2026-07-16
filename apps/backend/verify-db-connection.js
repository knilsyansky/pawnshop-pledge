const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

dotenv.config({ path: path.resolve(__dirname, envFile) });

const connectionString = process.env.DATABASE_URL;

if(!connectionString) {
    throw new Error('DATABASE_URL not defined');
}

const client = new Client({ connectionString });

async function verifyConnection() {
  try {
    await client.connect();
    console.log('PostgreSQL connection successful');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message || error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyConnection();
