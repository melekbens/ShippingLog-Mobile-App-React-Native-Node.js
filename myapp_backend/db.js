import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const sql = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Test connection
sql.getConnection()
  .then(() => console.log("✅ MySQL connected successfully"))
  .catch(err => console.error("❌ MySQL connection error:", err));


