const mysql = require('mysql2/promise');
const pool = mysql.createPool(require('./mysqlOptions')());
module.exports = pool;
