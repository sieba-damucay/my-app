import mysql from "mysql";

// ======================= Database Config =======================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "may220001", 
  database: "qr_attendance",
});




db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    return;
  }
  console.log("MySQL connected successfully!");
});

export default db;
