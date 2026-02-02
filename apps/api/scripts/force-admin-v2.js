const { createClient } = require('@supabase/supabase-js');

// Hardcoded for immediate fix based on previous output partials and standard dev keys if available, 
// BUT since I can't see the full key in the truncated output, I will try to read it differently or assume the user can run it.
// Wait, I see the output was truncated. I will try to read the file again with a larger buffer or just grep the key.

// Actually, I'll try to use the 'dotenv' pattern properly if installed, or just read the file line by line in node.

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../../apps/api/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="(.*)"/);
const serviceKey = serviceKeyMatch ? serviceKeyMatch[1] : null;

const urlMatch = envContent.match(/SUPABASE_URL="(.*)"/);
const supabaseUrl = urlMatch ? urlMatch[1] : 'https://mhaqatbmjugdodaczlmc.supabase.co';

if (!serviceKey) {
    console.error('Failed to extract SERVICE_KEY from ' + envPath);
    console.log('Content preview:', envContent.substring(0, 100));
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
