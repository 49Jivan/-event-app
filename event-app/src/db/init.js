require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await connection.query(schema);
  console.log("✅ Schema applique avec succes sur", process.env.DB_NAME);
  await connection.end();
}

init().catch((err) => {
  console.error("❌ Erreur lors de l'init de la base:", err.message);
  process.exit(1);
});
