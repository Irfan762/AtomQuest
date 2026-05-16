require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const count = await User.countDocuments();
    console.log(`Total users in DB: ${count}`);
    const users = await User.find({}, 'name email role');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
