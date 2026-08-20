const express = require("express");
const pool = require("../db/pool");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/bookings/:eventId - reserver un ticket pour un evenement
router.post("/:eventId", verifyToken, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [events] = await conn.query(
      `SELECT e.id, e.capacity,
        (SELECT COUNT(*) FROM bookings b WHERE b.event_id = e.id AND b.status = 'confirmed') AS taken
       FROM events e WHERE e.id = ? FOR UPDATE`,
      [eventId]
    );
    const event = events[0];
    if (!event) {
      await conn.rollback();
      return res.status(404).json({ error: "Evenement introuvable" });
    }
    if (event.taken >= event.capacity) {
      await conn.rollback();
      return res.status(409).json({ error: "Plus de places disponibles pour cet evenement" });
    }

    const [existing] = await conn.query(
      "SELECT id, status FROM bookings WHERE event_id = ? AND user_id = ?",
      [eventId, userId]
    );

    if (existing.length > 0) {
      if (existing[0].status === "confirmed") {
        await conn.rollback();
        return res.status(409).json({ error: "Vous avez deja un ticket pour cet evenement" });
      }
      // reactive un ticket precedemment annule
      await conn.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [existing[0].id]);
      await conn.commit();
      return res.status(200).json({ id: existing[0].id, success: true });
    }

    const [result] = await conn.query(
      "INSERT INTO bookings (event_id, user_id, status) VALUES (?, ?, 'confirmed')",
      [eventId, userId]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la reservation" });
  } finally {
    conn.release();
  }
});

// GET /api/bookings/me - mes tickets
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id AS booking_id, b.status, b.created_at AS booked_at,
              e.id AS event_id, e.title, e.event_date, e.location, e.price
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       WHERE b.user_id = ?
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/bookings/:id - annuler mon ticket
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ticket introuvable" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'annulation" });
  }
});

module.exports = router;
