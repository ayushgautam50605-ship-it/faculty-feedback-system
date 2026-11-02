const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/analyticsController");

router.use(authenticate, authorize("hod"));
router.get("/dashboard", ctrl.getDashboard);
router.get("/faculty", ctrl.getFacultyComparison);
router.get("/criteria", ctrl.getCriteriaBreakdown);
router.get("/trend", ctrl.getSemesterTrend);
router.get("/recent-activity", ctrl.getRecentActivity);
router.get("/filters", ctrl.getFilterOptions);

module.exports = router;
