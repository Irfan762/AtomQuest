const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/goalgrid");
    console.log(`[goalgrid] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[goalgrid] Atlas/Local MongoDB Connection failed: ${error.message}`);
    console.log(`[goalgrid] Starting fallback In-Memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[goalgrid] In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`[goalgrid] Fallback In-Memory MongoDB failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
