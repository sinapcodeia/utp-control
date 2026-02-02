const crypto = require('crypto');

// Parameters from JWKS
const x = 'gBAoFC2ytMeZDF3WHW43RGtbbgJl9b4Q-_xvDY0WC9w';
const y = 'ZmAv3DKVofejSxQbPMyhOR9U-WEdfY91CsKwPdOUtFg';

// Base64Url decode helper
function b64uToBuffer(b64u) {
    return Buffer.from(b64u.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

const xBuf = b64uToBuffer(x);
const yBuf = b64uToBuffer(y);

// Create the public key
const key = crypto.createPublicKey({
    key: {
        kty: 'EC',
        crv: 'P-256',
        x: x,
        y: y
    },
    format: 'jwk'
});

const pem = key.export({ type: 'spki', format: 'pem' });
console.log('--- PEM PUBLIC KEY ---');
console.log(pem);
