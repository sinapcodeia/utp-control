const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Hardcoded fallback for debugging if reading fails, but trying to read first
function getServiceKey() {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../../apps/api/.env'), 'utf-8');
        const match = content.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
        if (match) return match[1].trim().replace(/"/g, '');
    } catch (e) {
        console.error('Could not read api .env');
    }
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function getUrl() {
    try {
        const content = fs.readFileSync(path.join(__dirname, '../../../apps/web/.env.local'), 'utf-8');
        const match = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
        if (match) return match[1].trim().replace(/"/g, '');
    } catch (e) { }
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

const supabaseUrl = getUrl();
const serviceKey = getServiceKey();

if (!supabaseUrl || !serviceKey) {
    console.error('CRITICAL: Could not find URL or SERVICE_KEY');
    console.log('URL:', supabaseUrl);
    console.log('KEY Length:', serviceKey ? serviceKey.length : 0);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function forceCreateAdmin() {
    const email = 'admin@test.com';
    const password = 'UTPControl2026!';

    console.log(`Force creating ${email}...`);

    // 1. List users to find ID
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('List Error:', listError);
        return;
    }

    const existing = listData.users.find(u => u.email === email);
    if (existing) {
        console.log(`Found existing user ${existing.id}. Deleting...`);
        const { error: delError } = await supabase.auth.admin.deleteUser(existing.id);
        if (delError) console.error('Delete Error:', delError);
        else console.log('Deleted.');
    }

    // 2. Create
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin Test Forced' }
    });

    if (error) {
        console.error('Create Error:', error);
    } else {
        console.log('Created successfully:', data.user.id);
    }
}

forceCreateAdmin();
