import { createClient } from '@supabase/supabase-js';

// Credenciales
const SUPABASE_URL = "https://mhaqatbmjuqdodaczlmc.supabase.co";
const SUPABASE_KEY = "sb_publishable_QLG-swRePQ0day0-lQ9ZmQ_b1eFUA2e";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAuth() {
    console.log('🔄 Iniciando prueba de autenticación...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'antonio_rburgos@msn.com',
        password: 'Tomiko@6532'
    });

    if (error) {
        console.error('❌ Error en Login:', error.message);
        return;
    }

    const token = data.session.access_token;
    console.log('✅ Login Supabase OK. Token obtenido.');

    try {
        const response = await fetch('http://localhost:3001/reports', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`📡 API Response: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
            console.log('✅ ¡ÉXITO! La API aceptó el token.');
            const json = await response.json();
            console.log(`📄 Reportes: ${Array.isArray(json) ? json.length : 'OK'}`);
        } else {
            console.log('❌ Falló la autenticación en API.');
            console.log(await response.text());
        }

    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
    }
}

testAuth();
