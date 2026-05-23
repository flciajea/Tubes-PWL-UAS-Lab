const mongoose = require("mongoose");

// Sub-schema: Riwayat Penerimaan Barang
const itemReceiptSchema = new mongoose.Schema(
  {
    quantity_received: { type: Number, required: true, min: 1 },
    received_date: { type: Date, required: true },
    received_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: true }
);

// Sub-schema: Item Barang Pengadaan
const procurementItemSchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true, trim: true },
    item_type: { type: String, enum: ["inventaris", "bhp"], required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    purchase_link: { type: String, default: null },
    replaced_inventory_id: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", default: null },
    approval_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    receipts: { type: [itemReceiptSchema], default: [] },
  },
  { _id: true }
);

// Virtual: total barang diterima
procurementItemSchema.virtual("total_received").get(function () {
  return this.receipts.reduce((sum, r) => sum + r.quantity_received, 0);
});

// Main Schema
const procurementDraftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    status: { type: String, enum: ["draft", "locked", "finalized"], default: "draft" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewed_at: { type: Date, default: null },
    items: { type: [procurementItemSchema], default: [] },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("ProcurementDraft", procurementDraftSchema);