import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { URL } from "url";

// Load .env from env folder
dotenv.config({ path: path.resolve("./env/.env") });

// Parse the DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
console.log(process.env.DATABASE_URL);

const db = mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  port: dbUrl.port || 3306,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    return;
  }
  console.log("MySQL connected successfully!");

  // 🔍 Test query
  db.query("SELECT 1 + 1 AS result", (err, rows) => {
    if (err) {
      console.error("Test query failed:", err.message);
    } else {
      console.log("Test query result:", rows[0].result);
    }
  });
});

export default db;
