const asyncHandler = require("express-async-handler");
const aiService = require("../services/ai.service");
const Goal = require("../models/Goal");
const User = require("../models/User");
const { httpError } = require("../utils/helpers");

exports.analyzeGoal = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title) throw httpError(400, "Title is required");
  const analysis = await aiService.analyzeGoal(title, description);
  res.json(analysis);
});

exports.generateReview = asyncHandler(async (req, res) => {
  const { employee_id } = req.params;
  const user = await User.findOne({ id: employee_id });
  if (!user) throw httpError(404, "User not found");

  const goals = await Goal.find({ employee_id }).lean();
  const review = await aiService.generatePerformanceReview(user, goals);
  res.json(review);
});

exports.getRecommendations = asyncHandler(async (req, res) => {
  const { department, thrustArea } = req.query;
  const recs = await aiService.getGoalRecommendations(department, thrustArea);
  res.json(recs);
});

exports.chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const msg = message.toLowerCase();
  
  let response = "I'm your GoalGrid AI Assistant. How can I help you today?";
  let action = null;

  if (msg.includes("delayed") || msg.includes("risk")) {
    response = "I've identified 3 goals currently at risk. You can view them in the Analytics dashboard.";
    action = "/analytics";
  } else if (msg.includes("top performer") || msg.includes("best")) {
    response = "The top performer this quarter is Alice, with an average goal completion of 94%.";
    action = "/analytics";
  } else if (msg.includes("approval") || msg.includes("pending")) {
    response = "You have 2 pending goal approvals waiting for your review.";
    action = "/approvals";
  } else if (msg.includes("create") || msg.includes("new goal")) {
    response = "I can help you create a SMART goal. Navigating to the Goals page...";
    action = "/goals";
  }

  res.json({ response, action });
});
