const MySQLStore = require('express-mysql-session');
const session = require('express-session');
const options = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, createDatabaseTable: true };
const Store = MySQLStore(session);
module.exports = session({ secret: process.env.SESSION_SECRET, store: new Store(options), resave: false, saveUninitialized: false, rolling: true, cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 60 * 1000 } });
