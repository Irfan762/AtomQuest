const router = require("express").Router();
const c = require("../controllers/notification.controller");
const { authRequired } = require("../middleware/auth");

router.get("/", authRequired, c.list);
router.post("/:id/read", authRequired, c.markRead);

module.exports = router;
