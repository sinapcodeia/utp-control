// Script para simular la petición del frontend a /reports
const https = require('https');

// Primero necesitamos obtener un token de Supabase
// Para esto, simulamos un login

const SUPABASE_URL = 'https://mhaqatbmjuqdodaczlmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QLG-swRePQ0day0-lQ9ZmQ_b1eFUA2e'; // Tomado del .env

async function testReportsEndpoint() {
    console.log('🔍 Probando endpoint /reports...\n');

    // Paso 1: Login en Supabase
    console.log('1. Intentando login en Supabase...');

    const loginData = JSON.stringify({
        email: 'antonio_rburgos@msn.com',
        password: 'Tomiko@6532'
    });

    const loginOptions = {
        hostname: 'mhaqatbmjuqdodaczlmc.supabase.co',
        port: 443,
        path: '/auth/v1/token?grant_type=password',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Content-Length': loginData.length
        }
    };

    const loginReq = https.request(loginOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                const response = JSON.parse(data);
                const accessToken = response.access_token;
                console.log('✅ Login exitoso');
                console.log(`Token: ${accessToken.substring(0, 20)}...`);

                // Paso 2: Probar endpoint /reports
                testReportsWithToken(accessToken);
            } else {
                console.error('❌ Error en login:', res.statusCode);
                console.error(data);
            }
        });
    });

    loginReq.on('error', (error) => {
        console.error('❌ Error de red:', error);
    });

    loginReq.write(loginData);
    loginReq.end();
}

function testReportsWithToken(token) {
    console.log('\n2. Probando endpoint /reports con token...');

    const http = require('http');
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/reports',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`\nStatus: ${res.statusCode}`);
            console.log('Headers:', res.headers);
            console.log('\nResponse:');
            try {
                const json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
            } catch (e) {
                console.log(data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error:', error);
    });

    req.end();
}

testReportsEndpoint();
