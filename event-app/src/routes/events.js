const express = require("express");
const pool = require("../db/pool");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/events - liste publique, avec places restantes
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.*,
        (e.capacity - COALESCE(b.taken, 0)) AS remaining_seats
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS taken
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY event_id
      ) b ON b.event_id = e.id
      ORDER BY e.event_date ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/events/:id - detail d'un evenement
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        e.*,
        (e.capacity - COALESCE(b.taken, 0)) AS remaining_seats
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) AS taken
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY event_id
      ) b ON b.event_id = e.id
      WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Evenement introuvable" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/events - creation (admin uniquement)
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, location, capacity, price } = req.body;
    if (!title || !event_date || !location || !capacity) {
      return res.status(400).json({
        error: "title, event_date, location et capacity sont requis",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_date, location, capacity, price, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, event_date, location, capacity, price || 0, req.user.id]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la creation" });
  }
});

// PUT /api/events/:id - modification (admin uniquement)
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, event_date, location, capacity, price } = req.body;
    const [result] = await pool.query(
      `UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, capacity = ?, price = ?
       WHERE id = ?`,
      [title, description || null, event_date, location, capacity, price || 0, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evenement introuvable" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la modification" });
  }
});

// DELETE /api/events/:id - suppression (admin uniquement)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Evenement introuvable" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});

module.exports = router;
