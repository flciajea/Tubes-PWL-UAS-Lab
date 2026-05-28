const Inventory        = require("../models/Inventory");
const ProcurementDraft = require("../models/ProcurementDraft");

// ── Get semua inventaris ─────────────────────────────────────
const getAllInventories = async (req, res) => {
  try {
    const inventories = await Inventory.find()
      .populate("room_id", "room_name location")
      .sort({ created_at: -1 });
    res.json({ data: inventories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Get detail inventaris ────────────────────────────────────
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate("room_id", "room_name location");
    if (!inventory) return res.status(404).json({ message: "Inventaris tidak ditemukan" });
    res.json({ data: inventory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Update label & QR (Staf Admin) ──────────────────────────
const updateInventory = async (req, res) => {
  try {
    const { label_number, qr_barcode_path, room_id, condition_status } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: "Inventaris tidak ditemukan" });

    if (label_number    !== undefined) inventory.label_number    = label_number;
    if (qr_barcode_path !== undefined) inventory.qr_barcode_path = qr_barcode_path;
    if (room_id         !== undefined) inventory.room_id         = room_id || null;
    if (condition_status !== undefined) inventory.condition_status = condition_status;

    await inventory.save();
    res.json({ message: "Inventaris berhasil diupdate", data: inventory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Input penerimaan barang (Staf Admin) ─────────────────────
const addReceipt = async (req, res) => {
  try {
    const { quantity_received, received_date } = req.body;
    if (!quantity_received || !received_date)
      return res.status(400).json({ message: "quantity_received dan received_date wajib diisi" });

    // Cari draf yang mengandung item ini
    const draft = await ProcurementDraft.findOne({
      "items._id": req.params.itemId,
      status: "finalized"
    });
    if (!draft) return res.status(404).json({ message: "Item tidak ditemukan di draf finalisasi" });

    const item = draft.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

    // Cek total sudah diterima
    const totalReceived = item.receipts.reduce((sum, r) => sum + r.quantity_received, 0);
    if (totalReceived + quantity_received > item.quantity)
      return res.status(400).json({
        message: `Melebihi jumlah yang dipesan. Sisa: ${item.quantity - totalReceived}`
      });

    // Tambah receipt
    item.receipts.push({
      quantity_received,
      received_date,
      received_by: req.user.id
    });
    await draft.save();

    // Jika item tipe inventaris, buat entry di inventories
    if (item.item_type === "inventaris") {
      for (let i = 0; i < quantity_received; i++) {
        await Inventory.create({
          procurement_item_id: item._id,
          item_name: item.item_name,
        });
      }
    }

    res.status(201).json({ message: "Penerimaan barang berhasil dicatat", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllInventories, getInventoryById, updateInventory, addReceipt };