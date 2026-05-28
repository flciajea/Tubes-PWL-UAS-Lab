const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    procurement_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    label_number: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    qr_barcode_path: {
      type: String,
      default: null,
    },
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    condition_status: {
      type: String,
      enum: ["baik", "rusak_ringan", "rusak_berat", "dihapus"],
      default: "baik",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);