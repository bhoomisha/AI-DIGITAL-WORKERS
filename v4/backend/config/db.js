// const mysql = require('mysql2');
// require('dotenv').config();

// const db = mysql.createConnection({
//   host:     process.env.DB_HOST     || 'localhost',
//   user:     process.env.DB_USER     || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME     || 'labour_platform',
// });

// db.connect(err => {
//   if (err) { console.error('❌ MySQL connection failed:', err.message); process.exit(1); }
//   console.log('✅ MySQL Database Connected!');
// });

// module.exports = db;


const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 4000,
  ssl: {
    minVersion: 'TLSv1.2'
  }
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL Database Connected!');
});

module.exports = db;