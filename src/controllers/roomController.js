const Room = require("../models/Room");

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ created_at: -1 });
    res.json({ data: rooms });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });
    res.json({ data: room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { room_name, location } = req.body;
    if (!room_name) return res.status(400).json({ message: "Nama ruangan wajib diisi" });

    const room = await Room.create({ room_name, location });
    res.status(201).json({ message: "Ruangan berhasil dibuat", data: room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { room_name, location } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });

    if (room_name) room.room_name = room_name;
    if (location !== undefined) room.location = location;
    await room.save();

    res.json({ message: "Ruangan berhasil diupdate", data: room });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Ruangan tidak ditemukan" });

    await room.deleteOne();
    res.json({ message: "Ruangan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };