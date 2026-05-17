const router = require("express").Router();
const c = require("../controllers/goal.controller");
const { authRequired } = require("../middleware/auth");
const { requireRoles } = require("../middleware/role");

// Base CRUD
router.post("/", authRequired, c.create);
router.get("/", authRequired, c.list);
router.post("/shared", authRequired, requireRoles("manager", "admin"), c.pushShared);
router.put("/approve/:goal_id", authRequired, requireRoles("manager", "admin"), c.approve);
router.put("/reject/:goal_id", authRequired, requireRoles("manager", "admin"), c.reject);
router.post("/:goal_id/submit", authRequired, c.submit);

// 5 Unique Enterprise Features Endpoints
router.get("/alignment-tree", authRequired, c.alignmentTree);
router.get("/timeline", authRequired, c.timeline);
router.post("/detect-conflicts", authRequired, requireRoles("admin"), c.detectConflicts);
router.get("/conflicts", authRequired, c.listConflicts);
router.put("/conflicts/:id/resolve", authRequired, requireRoles("admin"), c.resolveConflict);

// Scenarios Endpoints
router.get("/scenarios", authRequired, requireRoles("manager", "admin"), c.listScenarios);
router.post("/scenarios", authRequired, requireRoles("manager", "admin"), c.saveScenario);
router.delete("/scenarios/:id", authRequired, requireRoles("manager", "admin"), c.deleteScenario);

// Base Param-based CRUD (Keep at bottom so static paths aren't matched as parameters)
router.get("/:goal_id", authRequired, c.getOne);
router.put("/:goal_id", authRequired, c.update);
router.delete("/:goal_id", authRequired, c.remove);

module.exports = router;
