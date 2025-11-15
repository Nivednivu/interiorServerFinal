
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Use connection pool instead of single connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "bbbirijzpkb7zpmefw7b-mysql.services.clever-cloud.com",
  user: process.env.DB_USER || "uvfmrzrkqmoxdzws",
  password: process.env.DB_PASSWORD || "b3QNIwwmTJOkvgc63tGy", // You're using username as password!
  database: process.env.DB_NAME || "bbbirijzpkb7zpmefw7b",
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }, // Required for Clever Cloud
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000, 
  timeout: 60000,
  reconnect: true
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Clever Cloud MySQL Connection Failed:", err.message);
    console.log("🔧 Troubleshooting Tips:");
    console.log("1. Check if password is correct (not using username as password)");
    console.log("2. Verify database name and host");
    console.log("3. Check if IP is whitelisted in Clever Cloud");
    console.log("4. Ensure SSL is enabled");
  } else {
    console.log("✅ Connected to Clever Cloud MySQL Database");
    console.log("📊 Database:", connection.config.database);
    connection.release();
  }
});

// Handle connection errors
db.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  }
});

export default db;
