const MySQLStore = require('express-mysql-session');
const session = require('express-session');
const db = require('./db');
const Store = MySQLStore(session);
module.exports = session({ secret: process.env.SESSION_SECRET, store: new Store({ createDatabaseTable: true }, db), resave: false, saveUninitialized: false, rolling: true, cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 60 * 1000 } });
