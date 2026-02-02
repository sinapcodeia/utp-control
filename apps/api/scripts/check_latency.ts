import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mhaqatbmjuqdodaczlmc.supabase.co";
const SUPABASE_KEY = "sb_publishable_QLG-swRePQ0day0-lQ9ZmQ_b1eFUA2e";
const API_URL = "http://localhost:3001";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkLatency() {
    console.log('🔄 Autenticando...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'antonio_rburgos@msn.com',
        password: 'Tomiko@6532'
    });

    if (error || !data.session) {
        console.error('Login error:', error?.message);
        return;
    }

    const token = data.session.access_token;
    console.log('✅ Token obtenido. Iniciando Request...');

    const start = performance.now();
    try {
        const res = await fetch(`${API_URL}/territory/my-visits`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const end = performance.now();

        console.log(`📡 Status: ${res.status}`);
        console.log(`⏱️ Tiempo Total Cliente: ${(end - start).toFixed(2)} ms`);

        if (res.ok) {
            const body = await res.json();
            console.log(`📦 Datos recibidos: ${body.length} items`);
        } else {
            console.log(await res.text());
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

checkLatency();
