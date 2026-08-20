const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email et password sont requis" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caracteres" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Un compte existe deja avec cet email" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hash]
    );

    const user = { id: result.insertId, name, email, role: "user" };
    const token = signToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email et password sont requis" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

module.exports = router;
