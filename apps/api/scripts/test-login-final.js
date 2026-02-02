const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// URL CORREGIDA (juq)
const SUPABASE_URL = 'https://mhaqatbmjuqdodaczlmc.supabase.co';

function getAnonKey() {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../../apps/web/.env.local'), 'utf-8');
        const match = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="(.*)"/);
        if (match) return match[1];
    } catch (e) { }
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

const anonKey = getAnonKey();

if (!anonKey) {
    console.error('Could not find Anon Key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, anonKey);

async function testLogin(email, password) {
    console.log(`Testing login for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error(`FAILED: ${error.message}`);
    } else {
        console.log(`SUCCESS: User ID ${data.user.id}`);
        console.log(`Access Token: ${data.session.access_token.substring(0, 20)}...`);
    }
}

async function main() {
    await testLogin('admin@test.com', 'UTPControl2026!');
}

main();
