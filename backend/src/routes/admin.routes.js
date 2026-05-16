const router = require("express").Router();
const c = require("../controllers/admin.controller");
const { authRequired } = require("../middleware/auth");
const { requireRoles } = require("../middleware/role");

router.put("/unlock/:goal_id", authRequired, requireRoles("admin"), c.unlock);
router.get("/audit", authRequired, requireRoles("admin"), c.audit);

module.exports = router;
