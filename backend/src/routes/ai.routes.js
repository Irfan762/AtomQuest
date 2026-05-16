const router = require("express").Router();
const c = require("../controllers/ai.controller");
const { authRequired } = require("../middleware/auth");

router.post("/analyze", authRequired, c.analyzeGoal);
router.get("/recommendations", authRequired, c.getRecommendations);
router.get("/review/:employee_id", authRequired, c.generateReview);
router.post("/chat", authRequired, c.chat);

module.exports = router;
