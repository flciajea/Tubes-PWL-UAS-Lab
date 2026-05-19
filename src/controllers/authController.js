const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Register ────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { nrp_nip, name, email, password, role } = req.body;

    // Cek apakah email atau nrp_nip sudah terdaftar
    const existingUser = await User.findOne({ $or: [{ email }, { nrp_nip }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email atau NRP/NIP sudah terdaftar" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await User.create({
      nrp_nip,
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: {
        id: user._id,
        nrp_nip: user.nrp_nip,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Login ───────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      data: {
        id: user._id,
        nrp_nip: user.nrp_nip,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Get Profile (user yang sedang login) ────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getProfile };