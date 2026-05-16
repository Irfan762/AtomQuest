const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/goalgrid");
    console.log(`[goalgrid] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[goalgrid] Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
