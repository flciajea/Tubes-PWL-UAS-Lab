const BhpStock       = require("../models/BhpStock");
const MaintenanceLog = require("../models/MaintenanceLog");
const Inventory      = require("../models/Inventory");

// ── GET SEMUA STOK BHP ──────────────────────────────────────────
const getAllBhpStock = async (req, res) => {
  try {
    const bhpStocks = await BhpStock.find()
      .populate("room_id", "room_name location")
      .sort({ created_at: -1 });
    res.json({ data: bhpStocks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET DETAIL STOK BHP ─────────────────────────────────────────
const getBhpStockById = async (req, res) => {
  try {
    const bhpStock = await BhpStock.findById(req.params.id)
      .populate("room_id", "room_name location");
    if (!bhpStock) return res.status(404).json({ message: "Stok BHP tidak ditemukan" });
    res.json({ data: bhpStock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── CREATE STOK BHP (Admin/Kepala Lab) ──────────────────────────
const createBhpStock = async (req, res) => {
  try {
    const { item_name, category, unit, quantity, reorder_level, room_id, notes } = req.body;
    
    if (!item_name || !category || !unit || quantity === undefined)
      return res.status(400).json({ 
        message: "item_name, category, unit, dan quantity wajib diisi" 
      });

    const bhpStock = await BhpStock.create({
      item_name,
      category,
      unit,
      quantity,
      reorder_level: reorder_level || 5,
      room_id: room_id || null,
      notes,
    });

    res.status(201).json({ 
      message: "Stok BHP berhasil ditambahkan", 
      data: bhpStock 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── UPDATE STOK BHP (Admin/Kepala Lab) ──────────────────────────
const updateBhpStock = async (req, res) => {
  try {
    const { item_name, category, unit, quantity, reorder_level, room_id, notes } = req.body;
    const bhpStock = await BhpStock.findById(req.params.id);
    if (!bhpStock) return res.status(404).json({ message: "Stok BHP tidak ditemukan" });

    if (item_name !== undefined) bhpStock.item_name = item_name;
    if (category !== undefined) bhpStock.category = category;
    if (unit !== undefined) bhpStock.unit = unit;
    if (quantity !== undefined) bhpStock.quantity = Math.max(0, quantity);
    if (reorder_level !== undefined) bhpStock.reorder_level = reorder_level;
    if (room_id !== undefined) bhpStock.room_id = room_id || null;
    if (notes !== undefined) bhpStock.notes = notes;

    await bhpStock.save();
    res.json({ message: "Stok BHP berhasil diupdate", data: bhpStock });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET SEMUA MAINTENANCE LOG ───────────────────────────────────
const getAllMaintenanceLogs = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find()
      .populate("inventory_id", "item_name label_number")
      .populate("performed_by", "name nrp_nip")
      .populate("used_bhp.bhp_id", "item_name unit")
      .sort({ maintenance_date: -1 });
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET DETAIL MAINTENANCE LOG ──────────────────────────────────
const getMaintenanceLogById = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate("inventory_id", "item_name label_number")
      .populate("performed_by", "name nrp_nip")
      .populate("used_bhp.bhp_id", "item_name unit");
    if (!log) return res.status(404).json({ message: "Log maintenance tidak ditemukan" });
    res.json({ data: log });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── CREATE MAINTENANCE LOG (Staf Lab) ───────────────────────────
const createMaintenanceLog = async (req, res) => {
  try {
    const {
      inventory_id,
      maintenance_type,
      description,
      condition_before,
      condition_after,
      used_bhp,
      maintenance_date,
      notes,
    } = req.body;

    // Validasi field wajib
    if (!inventory_id || !maintenance_type || !description || !condition_before || !condition_after)
      return res.status(400).json({ 
        message: "inventory_id, maintenance_type, description, condition_before, condition_after wajib diisi" 
      });

    // Cek inventory exists
    const inventory = await Inventory.findById(inventory_id);
    if (!inventory) return res.status(404).json({ message: "Inventaris tidak ditemukan" });

    // Buat maintenance log
    const maintenanceLog = await MaintenanceLog.create({
      inventory_id,
      item_name: inventory.item_name,
      maintenance_type,
      description,
      condition_before,
      condition_after,
      used_bhp: used_bhp || [],
      maintenance_date: maintenance_date || new Date(),
      performed_by: req.user.id,
      notes,
    });

    // Jika ada BHP yang digunakan, kurangi stoknya
    if (used_bhp && Array.isArray(used_bhp)) {
      for (const bhp of used_bhp) {
        if (bhp.bhp_id && bhp.quantity_used) {
          const bhpStock = await BhpStock.findById(bhp.bhp_id);
          if (bhpStock) {
            bhpStock.quantity = Math.max(0, bhpStock.quantity - bhp.quantity_used);
            await bhpStock.save();
          }
        }
      }
    }

    // Update kondisi inventory
    inventory.condition_status = condition_after;
    await inventory.save();

    const populatedLog = await MaintenanceLog.findById(maintenanceLog._id)
      .populate("inventory_id", "item_name label_number")
      .populate("performed_by", "name nrp_nip")
      .populate("used_bhp.bhp_id", "item_name unit");

    res.status(201).json({ 
      message: "Maintenance log berhasil dibuat dan stok BHP terupdate", 
      data: populatedLog 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET INVENTORY ITEMS untuk maintenance ────────────────────────
const getInventoriesForMaintenance = async (req, res) => {
  try {
    const inventories = await Inventory.find({
      condition_status: { $ne: "dihapus" },
    })
      .populate("room_id", "room_name location")
      .sort({ item_name: 1 });
    res.json({ data: inventories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── GET STATISTIK UNTUK STAF LAB ────────────────────────────────
const getLabStats = async (req, res) => {
  try {
    const totalBhpItems = await BhpStock.countDocuments();
    const lowStockItems = await BhpStock.countDocuments({ 
      $expr: { $lte: ["$quantity", "$reorder_level"] } 
    });
    const totalMaintenanceLogs = await MaintenanceLog.countDocuments();
    const monthlyMaintenanceLogs = await MaintenanceLog.countDocuments({
      maintenance_date: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });

    res.json({
      data: {
        totalBhpItems,
        lowStockItems,
        totalMaintenanceLogs,
        monthlyMaintenanceLogs,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllBhpStock,
  getBhpStockById,
  createBhpStock,
  updateBhpStock,
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  getInventoriesForMaintenance,
  getLabStats,
};
