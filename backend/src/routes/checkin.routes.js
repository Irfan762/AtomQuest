const router = require("express").Router();
const c = require("../controllers/checkin.controller");
const { authRequired } = require("../middleware/auth");

router.post("/:goal_id", authRequired, c.submit);
router.post("/:goal_id/comment", authRequired, c.addManagerComment);

module.exports = router;
