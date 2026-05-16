const router = require("express").Router();
const c = require("../controllers/user.controller");
const { authRequired } = require("../middleware/auth");
const { requireRoles } = require("../middleware/role");

router.get("/", authRequired, c.list);
router.get("/managers", authRequired, c.managers);
router.post("/", authRequired, requireRoles("admin"), c.create);
router.delete("/:user_id", authRequired, requireRoles("admin"), c.remove);

module.exports = router;
