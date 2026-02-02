require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    console.log('Testing connection with URL from .env...');
    try {
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined in .env');
        }
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Connection Successful! Server time:', res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}

testConnection();
