require('dotenv').config();
const crypto = require('../src/engine/crypto');
crypto.assertKey();
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 characters.');
}

module.exports = require('../src/app');
