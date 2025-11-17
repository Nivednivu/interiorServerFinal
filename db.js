import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Use connection pool with reduced limit for Clever Cloud free tier
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  
  // REDUCED FOR CLEVER CLOUD FREE TIER
  connectionLimit: 3, // Changed from 10 to 3
  acquireTimeout: 10000,
  timeout: 60000,
  queueLimit: 0,
  waitForConnections: true,
  
  // Better connection management
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection with immediate release
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Clever Cloud MySQL Connection Failed:", err.message);
    
    if (err.message.includes('max_user_connections')) {
      console.log("💡 Max connections reached. Waiting 30 seconds...");
      setTimeout(() => {
        console.log("🔄 Retrying database connection...");
        db.getConnection((retryErr, retryConnection) => {
          if (retryErr) {
            console.error("❌ Retry failed:", retryErr.message);
          } else {
            console.log("✅ Connected after retry");
            retryConnection.release();
          }
        });
      }, 30000);
    }
  } else {
    console.log("✅ Connected to Clever Cloud MySQL Database");
    console.log("📊 Database:", connection.config.database);
    connection.release(); // IMPORTANT: Release immediately
  }
});

// Handle connection events
db.on('acquire', (connection) => {
  console.log('🔗 Connection acquired');
});

db.on('release', (connection) => {
  console.log('🔓 Connection released');
});

db.on('error', (err) => {  
  console.error('❌ Database pool error:', err.message);
});

export default db;