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

async function createEmergencyUser() {
    // Usamos un email con timestamp para garantizar unicidad y evitar bloqueos previos
    const uniqueId = Date.now();
    const email = `admin.sys.${uniqueId}@example.com`;
    const password = 'UTPControl2026!';

    console.log(`Attempting to register emergency user: ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Admin Emergency', accepted_terms: true }
        }
    });

    if (error) {
        console.error('REGISTRATION FAILED:', error.message);
        if (error.message.includes('rate limit')) {
            console.log('CRITICAL: IP Rate Limit detected. Cannot register via API.');
        }
    } else {
        console.log('REGISTRATION SUCCESS!');
        console.log(`User ID: ${data.user?.id}`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        // Save this credential to a file so the user sees it
        fs.writeFileSync('EMERGENCY_CREDENTIALS.txt', `Email: ${email}\nPassword: ${password}`);
    }
}

createEmergencyUser();
