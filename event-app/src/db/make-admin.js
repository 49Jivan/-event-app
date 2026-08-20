require("dotenv").config();
const pool = require("./pool");

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node src/db/make-admin.js <email>");
    process.exit(1);
  }

  const [result] = await pool.query("UPDATE users SET role = 'admin' WHERE email = ?", [email]);
  if (result.affectedRows === 0) {
    console.error(`❌ Aucun utilisateur trouve avec l'email ${email}`);
  } else {
    console.log(`✅ ${email} est maintenant administrateur`);
  }
  process.exit(0);
}

makeAdmin();
