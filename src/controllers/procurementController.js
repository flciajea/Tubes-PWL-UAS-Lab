const ProcurementDraft = require("../models/ProcurementDraft");

// ── Get semua draf ───────────────────────────────────────────
const getAllDrafts = async (req, res) => {
  try {
    const filter = req.user.role === "kepala_lab" ? { created_by: req.user.id } : {};
    const drafts = await ProcurementDraft.find(filter)
      .populate("created_by", "name")
      .sort({ created_at: -1 });
    res.json({ data: drafts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Get detail satu draf ─────────────────────────────────────
const getDraftById = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id)
      .populate("created_by", "name")
      .populate("reviewed_by", "name");
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    res.json({ data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Buat draf baru (Kepala Lab) ──────────────────────────────
const createDraft = async (req, res) => {
  try {
    const { title, year } = req.body;
    if (!title || !year) return res.status(400).json({ message: "Title dan tahun wajib diisi" });

    const draft = await ProcurementDraft.create({ title, year, created_by: req.user.id });
    res.status(201).json({ message: "Draf berhasil dibuat", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Update draf ──────────────────────────────────────────────
const updateDraft = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci, tidak bisa diubah" });

    const { title, year } = req.body;
    if (title) draft.title = title;
    if (year)  draft.year  = year;
    await draft.save();

    res.json({ message: "Draf berhasil diupdate", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Hapus draf ───────────────────────────────────────────────
const deleteDraft = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci, tidak bisa dihapus" });

    await draft.deleteOne();
    res.json({ message: "Draf berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Tambah item ke draf ──────────────────────────────────────
const addItem = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci" });

    const { item_name, item_type, price, quantity, purchase_link, replaced_inventory_id } = req.body;
    if (!item_name || !item_type || !price || !quantity)
      return res.status(400).json({ message: "item_name, item_type, price, quantity wajib diisi" });

    draft.items.push({ item_name, item_type, price, quantity, purchase_link, replaced_inventory_id });
    await draft.save();

    res.status(201).json({ message: "Item berhasil ditambahkan", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Update item di draf ──────────────────────────────────────
const updateItem = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci" });

    const item = draft.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

    const { item_name, item_type, price, quantity, purchase_link } = req.body;
    if (item_name)    item.item_name    = item_name;
    if (item_type)    item.item_type    = item_type;
    if (price)        item.price        = price;
    if (quantity)     item.quantity     = quantity;
    if (purchase_link !== undefined) item.purchase_link = purchase_link;

    await draft.save();
    res.json({ message: "Item berhasil diupdate", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Hapus item dari draf ─────────────────────────────────────
const deleteItem = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci" });

    draft.items.pull({ _id: req.params.itemId });
    await draft.save();
    res.json({ message: "Item berhasil dihapus", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Lock draf (submit ke Kaprodi) ────────────────────────────
const lockDraft = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "draft") return res.status(400).json({ message: "Draf sudah terkunci" });
    if (draft.items.length === 0) return res.status(400).json({ message: "Draf tidak boleh kosong" });

    draft.status = "locked";
    await draft.save();
    res.json({ message: "Draf berhasil dikunci dan dikirim ke Kaprodi", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Approve/Reject item (Kaprodi) ────────────────────────────
const reviewItem = async (req, res) => {
  try {
    const { approval_status } = req.body;
    if (!['approved', 'rejected'].includes(approval_status))
      return res.status(400).json({ message: "Status harus approved atau rejected" });

    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "locked")
      return res.status(400).json({ message: "Draf harus berstatus locked untuk direview" });

    const item = draft.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

    item.approval_status = approval_status;
    await draft.save();

    res.json({
      message: `Item berhasil ${approval_status === 'approved' ? 'disetujui' : 'ditolak'}`,
      data: draft
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── Finalisasi draf (Kaprodi) ────────────────────────────────
const finalizeDraft = async (req, res) => {
  try {
    const draft = await ProcurementDraft.findById(req.params.id);
    if (!draft) return res.status(404).json({ message: "Draf tidak ditemukan" });
    if (draft.status !== "locked")
      return res.status(400).json({ message: "Draf harus berstatus locked untuk difinalisasi" });

    const hasApproved = draft.items.some(i => i.approval_status === 'approved');
    if (!hasApproved)
      return res.status(400).json({ message: "Minimal 1 item harus disetujui sebelum finalisasi" });

    draft.status      = "finalized";
    draft.reviewed_by = req.user.id;
    draft.reviewed_at = new Date();
    await draft.save();

    res.json({ message: "Draf berhasil difinalisasi", data: draft });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllDrafts, getDraftById, createDraft, updateDraft,
  deleteDraft, addItem, updateItem, deleteItem, lockDraft,
  reviewItem, finalizeDraft
};