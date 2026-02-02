import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env');
let content = fs.readFileSync(envPath, 'utf-8');

// Corregir SUPABASE_JWT_SECRET eliminando comillas dobles
content = content.replace(/SUPABASE_JWT_SECRET="?([^"\n]+)"?/g, (match, p1) => {
    return `SUPABASE_JWT_SECRET=${p1.replace(/"/g, '')}`;
});

fs.writeFileSync(envPath, content);
console.log('--- .env SANITIZED ---');
