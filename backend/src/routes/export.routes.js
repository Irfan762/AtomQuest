const router = require("express").Router();
const c = require("../controllers/export.controller");
const { authRequired } = require("../middleware/auth");
const { requireRoles } = require("../middleware/role");

router.get("/goals.csv", authRequired, c.goalsCsv);
router.get("/goals.xlsx", authRequired, c.goalsXlsx);
router.get("/audit.csv", authRequired, requireRoles("admin"), c.auditCsv);

module.exports = router;
