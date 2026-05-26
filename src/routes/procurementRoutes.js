const express = require("express");
const router  = express.Router();
const {
  getAllDrafts, getDraftById, createDraft, updateDraft,
  deleteDraft, addItem, updateItem, deleteItem, lockDraft,
  reviewItem, finalizeDraft, revertToDraft
} = require("../controllers/procurementController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Draf
router.get("/",           authorize("kepala_lab", "kaprodi", "staf_admin", "admin"), getAllDrafts);
router.get("/:id",        authorize("kepala_lab", "kaprodi", "staf_admin", "admin"), getDraftById);
router.post("/",          authorize("kepala_lab"), createDraft);
router.put("/:id",        authorize("kepala_lab"), updateDraft);
router.delete("/:id",     authorize("kepala_lab"), deleteDraft);
router.patch("/:id/lock", authorize("kepala_lab"), lockDraft);

// Items
router.post("/:id/items",                 authorize("kepala_lab"), addItem);
router.put("/:id/items/:itemId",          authorize("kepala_lab"), updateItem);
router.delete("/:id/items/:itemId",       authorize("kepala_lab"), deleteItem);
router.patch("/:id/items/:itemId/review", authorize("kaprodi"),    reviewItem);
router.patch("/:id/finalize",             authorize("kaprodi"),    finalizeDraft);
router.patch("/:id/revert",              authorize("kaprodi"),    revertToDraft);

module.exports = router;