import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env');
const content = fs.readFileSync(envPath, 'utf-8');
const lines = content.split('\n');
const secretLine = lines.find(l => l.startsWith('SUPABASE_JWT_SECRET='));

if (secretLine) {
    const secret = secretLine.split('=')[1].trim();
    console.log('--- SECRET EXTRACTED ---');
    console.log('Length:', secret.length);
    console.log('Raw:', secret);
} else {
    console.log('SECRET NOT FOUND');
}
