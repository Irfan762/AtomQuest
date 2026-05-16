const router = require("express").Router();
const c = require("../controllers/auth.controller");
const { authRequired } = require("../middleware/auth");

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/logout", c.logout);
router.get("/me", authRequired, c.me);

module.exports = router;
