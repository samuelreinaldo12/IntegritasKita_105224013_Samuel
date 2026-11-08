import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';

const scrypt = promisify(scryptCallback);
const fixturePassword = 'sec-0.2 synthetic test password';
const salt = randomBytes(16);
const N = 32768;
const r = 8;
const p = 1;
const keyLength = 64;

const derivedKey = await scrypt(fixturePassword, salt, keyLength, {
  N,
  r,
  p,
  maxmem: 64 * 1024 * 1024,
});
const encoded = `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;

const [algorithm, nValue, rValue, pValue, saltValue, keyValue] = encoded.split('$');
assert.equal(algorithm, 'scrypt');
const verifiedKey = await scrypt(
  fixturePassword,
  Buffer.from(saltValue, 'base64'),
  Buffer.from(keyValue, 'base64').length,
  {
    N: Number(nValue),
    r: Number(rValue),
    p: Number(pValue),
    maxmem: 64 * 1024 * 1024,
  },
);
assert.ok(timingSafeEqual(Buffer.from(keyValue, 'base64'), verifiedKey));
assert.notEqual(encoded, fixturePassword);

console.log('sec-0.2 synthetic password-hash demonstration');
console.log(`KDF: scrypt (N=${N}, r=${r}, p=${p}; random 128-bit salt)`);
console.log(`Encoded test hash: ${encoded}`);
console.log('Fixture verification: PASS');
console.log('Real user data accessed: NO');
console.log('Plaintext password emitted: NO');
console.log('Application password storage implemented: NO (no account system exists)');
