require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middleware/errorHandler");
const seedDemoUsers = require("./src/services/seed.service");
const { initScheduler } = require("./src/services/scheduler.service");

const app = express();

// Connect to Database
connectDB();
initScheduler();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/users", require("./src/routes/user.routes"));
app.use("/api/goals", require("./src/routes/goal.routes"));
app.use("/api/checkins", require("./src/routes/checkin.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/analytics", require("./src/routes/analytics.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));
app.use("/api/export", require("./src/routes/export.routes"));
app.use("/api/ai", require("./src/routes/ai.routes"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`[goalgrid] Server running on port ${PORT}`);
  // Seed demo data
  try {
    await seedDemoUsers();
  } catch (err) {
    console.error("[goalgrid] Seeding failed:", err.message);
  }
});
