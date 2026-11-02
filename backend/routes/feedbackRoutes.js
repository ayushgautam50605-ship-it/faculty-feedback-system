const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/feedbackController");

router.get("/criteria", authenticate, ctrl.getCriteria);
router.get("/targets", authenticate, authorize("student"), ctrl.getTargets);
router.get("/status", authenticate, authorize("student"), ctrl.getStatus);
router.post("/", authenticate, authorize("student"), ctrl.submitFeedback);

module.exports = router;
