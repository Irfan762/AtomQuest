const router = require("express").Router();
const c = require("../controllers/analytics.controller");
const { authRequired } = require("../middleware/auth");

router.get("/dashboard", authRequired, c.dashboard);

module.exports = router;
