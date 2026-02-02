const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const paths = [path.join(__dirname, '../../../apps/web/.env.local')];
    const envVars = {};
    paths.forEach(p => {
        try {
            const content = fs.readFileSync(p, 'utf-8');
            content.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) envVars[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
            });
        } catch (e) { }
    });
    return envVars;
}

const env = getEnvVars();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function createV2() {
    const email = 'admin_v2@test.com';
    const password = 'UTPControl2026!';

    console.log(`Creating ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Admin V2', accepted_terms: true }
        }
    });

    if (error) console.error(error);
    else {
        console.log('Created V2 user:', data.user?.id);
        // Try login immediately
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) console.error('Login V2 Failed:', loginError.message);
        else console.log('Login V2 SUCCESS!');
    }
}

createV2();
