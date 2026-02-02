const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const paths = [
        path.join(__dirname, '../../../apps/web/.env.local'),
        path.join(__dirname, '../../../apps/api/.env')
    ];
    const envVars = {};
    paths.forEach(p => {
        try {
            if (fs.existsSync(p)) {
                const content = fs.readFileSync(p, 'utf-8');
                content.split('\n').forEach(line => {
                    const parts = line.split('=');
                    if (parts.length >= 2) {
                        envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
                    }
                });
            }
        } catch (e) { }
    });
    return envVars;
}

const env = getEnvVars();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
    await testLogin('coord@test.com', 'UTPControl2026!');
    await testLogin('gestor@test.com', 'UTPControl2026!');
}

main();
