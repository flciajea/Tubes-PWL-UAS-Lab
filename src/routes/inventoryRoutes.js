const express = require("express");
const router  = express.Router();
const { getAllInventories, getInventoryById, updateInventory, addReceipt } = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// PENTING: route /receive/:itemId harus di atas /:id
router.post("/receive/:itemId", authorize("staf_admin"), addReceipt);

router.get("/",    authorize("staf_admin", "staf_lab", "admin"), getAllInventories);
router.get("/:id", authorize("staf_admin", "staf_lab", "admin"), getInventoryById);
router.put("/:id", authorize("staf_admin"), updateInventory);

module.exports = router;