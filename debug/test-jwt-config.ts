import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const secret = process.env.SUPABASE_JWT_SECRET || '';
const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

console.log('--- SUPABASE CONFIG DIAGNOSIS ---');
console.log('URL:', url);
console.log('JWT Secret Length:', secret.length);
console.log('Anon Key Length:', anonKey.length);

if (secret === anonKey) {
    console.log('INFO: JWT Secret is the same as Anon Key.');
}

if (!url.startsWith('https://')) {
    console.warn('WARNING: Invalid Supabase URL format.');
}
