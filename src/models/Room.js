const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    room_name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("Room", roomSchema);