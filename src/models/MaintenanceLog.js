const mongoose = require("mongoose");

// Sub-schema: BHP yang digunakan dalam maintenance
const usedBhpSchema = new mongoose.Schema(
  {
    bhp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BhpStock",
      required: true,
    },
    item_name: {
      type: String,
      required: true,
    },
    quantity_used: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true }
);

const maintenanceLogSchema = new mongoose.Schema(
  {
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    item_name: {
      type: String,
      required: true,
    },
    maintenance_type: {
      type: String,
      enum: ["preventif", "korektif"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    condition_before: {
      type: String,
      enum: ["baik", "rusak_ringan", "rusak_berat"],
      required: true,
    },
    condition_after: {
      type: String,
      enum: ["baik", "rusak_ringan", "rusak_berat"],
      required: true,
    },
    used_bhp: {
      type: [usedBhpSchema],
      default: [],
    },
    maintenance_date: {
      type: Date,
      required: true,
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("MaintenanceLog", maintenanceLogSchema);
