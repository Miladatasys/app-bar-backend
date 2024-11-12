const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.AWS_USER,
  host: process.env.AWS_HOST,
  database: process.env.AWS_NAME,
  password: process.env.AWS_PASSWORD,
  port: process.env.AWS_PORT,
});


// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
//   });

  
  module.exports = {
    query: (text, params) => pool.query(text, params),
  };