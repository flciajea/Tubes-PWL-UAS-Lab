const jwt = require("jsonwebtoken");

// ── Verifikasi JWT Token ─────────────────────────────────────
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak, token tidak ada" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid atau sudah expired" });
  }
};

// ── Pembatasan Akses Berdasarkan Role ───────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak, hanya untuk: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };