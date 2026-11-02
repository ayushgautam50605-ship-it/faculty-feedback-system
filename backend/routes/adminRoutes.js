const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.use(authenticate, authorize("hod"));

router.get("/students", ctrl.listStudents);
router.post("/students", ctrl.createStudent);
router.delete("/students/:id", ctrl.deleteStudent);

router.post("/faculty", ctrl.createFaculty);
router.delete("/faculty/:id", ctrl.deleteFaculty);

router.get("/subjects", ctrl.listSubjects);
router.post("/subjects", ctrl.createSubject);
router.delete("/subjects/:id", ctrl.deleteSubject);

router.get("/criteria", ctrl.listCriteria);
router.post("/criteria", ctrl.createCriterion);
router.put("/criteria/:id", ctrl.updateCriterion);

router.get("/periods", ctrl.listPeriods);
router.post("/periods/open", ctrl.openPeriod);
router.post("/periods/close", ctrl.closePeriod);

router.get("/reports/appraisal.csv", ctrl.exportAppraisalCsv);

module.exports = router;
