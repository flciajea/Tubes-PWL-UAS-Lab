const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllBhpStock,
  getBhpStockById,
  createBhpStock,
  updateBhpStock,
  getAllMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  getInventoriesForMaintenance,
  getLabStats,
} = require("../controllers/labController");

// ── Protected routes (untuk semua yang terautentikasi) ──────────
router.get("/bhp-stocks", protect, getAllBhpStock);
router.get("/bhp-stocks/:id", protect, getBhpStockById);
router.get("/maintenance-logs", protect, getAllMaintenanceLogs);
router.get("/maintenance-logs/:id", protect, getMaintenanceLogById);
router.get("/inventories-maintenance", protect, getInventoriesForMaintenance);
router.get("/stats", protect, getLabStats);

// ── Routes yang bisa diakses oleh Admin/Kepala Lab/Staf Lab ──────
router.post(
  "/bhp-stocks",
  protect,
  authorize("admin", "kepala_lab", "staf_lab"),
  createBhpStock
);
router.put(
  "/bhp-stocks/:id",
  protect,
  authorize("admin", "kepala_lab", "staf_lab"),
  updateBhpStock
);

// ── Routes khusus Staf Lab ──────────────────────────────────────
router.post(
  "/maintenance-logs",
  protect,
  authorize("staf_lab"),
  createMaintenanceLog
);

module.exports = router;
