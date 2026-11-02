const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/facultyController");

router.get("/", authenticate, ctrl.listFaculty);
router.get("/:id", authenticate, ctrl.getFacultyById);
router.get("/:id/performance", authenticate, authorize("faculty", "hod"), ctrl.getPerformance);

module.exports = router;
