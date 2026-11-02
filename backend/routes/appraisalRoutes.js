const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/appraisalController");

router.get("/config", authenticate, authorize("hod"), ctrl.getAppraisalConfig);
router.put("/config", authenticate, authorize("hod"), ctrl.updateAppraisalConfig);
router.get("/:facultyId", authenticate, authorize("faculty", "hod"), ctrl.getAppraisal);
router.post("/generate", authenticate, authorize("hod"), ctrl.generateForFacultyOrAll);

module.exports = router;
