const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expire" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acces reserve aux administrateurs" });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
