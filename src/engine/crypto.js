const crypto = require('crypto');
const keyHex = process.env.DATA_ENCRYPTION_KEY || '';
function key() { if (!/^[a-f0-9]{64}$/i.test(keyHex)) throw new Error('DATA_ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes).'); return Buffer.from(keyHex, 'hex'); }
function encrypt(value) { if (value == null || value === '') return null; const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv); const data = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]); return [iv, cipher.getAuthTag(), data].map(b => b.toString('base64')).join('.'); }
function decrypt(value) { if (!value) return ''; const [iv, tag, data] = value.split('.').map(v => Buffer.from(v, 'base64')); const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv); decipher.setAuthTag(tag); return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8'); }
module.exports = { encrypt, decrypt, assertKey: key };
