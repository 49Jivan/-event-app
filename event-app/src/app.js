const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const eventsRoutes = require("./routes/events");
const bookingsRoutes = require("./routes/bookings");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/bookings", bookingsRoutes);

app.use((req, res) => res.status(404).json({ error: "Route introuvable" }));

module.exports = app;
