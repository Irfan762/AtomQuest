const router = require("express").Router();
const c = require("../controllers/goal.controller");
const { authRequired } = require("../middleware/auth");
const { requireRoles } = require("../middleware/role");

router.post("/", authRequired, c.create);
router.get("/", authRequired, c.list);
router.post("/shared", authRequired, requireRoles("manager", "admin"), c.pushShared);
router.put("/approve/:goal_id", authRequired, requireRoles("manager", "admin"), c.approve);
router.put("/reject/:goal_id", authRequired, requireRoles("manager", "admin"), c.reject);
router.post("/:goal_id/submit", authRequired, c.submit);
router.get("/:goal_id", authRequired, c.getOne);
router.put("/:goal_id", authRequired, c.update);
router.delete("/:goal_id", authRequired, c.remove);

module.exports = router;
