const mongoose = require("mongoose");

const bhpStockSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["perangkat keras & komponen", "bahan pembersih & perawatan lab", "alat tulis", "tinta & printer supplies", "jaringan & kelistrikan", "lainnya"],
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: "pcs",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorder_level: {
      type: Number,
      required: true,
      default: 5,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Virtual untuk status stok
bhpStockSchema.virtual("stock_status").get(function () {
  if (this.quantity === 0) return "habis";
  if (this.quantity <= this.reorder_level) return "rendah";
  return "normal";
});

bhpStockSchema.set("toJSON", { virtuals: true });
bhpStockSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("BhpStock", bhpStockSchema);
