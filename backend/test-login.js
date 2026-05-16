const axios = require("axios");

async function testLogin() {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@company.com",
      password: "Admin@123"
    });
    console.log("Login successful:", res.data.user.email);
  } catch (err) {
    console.error("Login failed:", err.response?.status, err.response?.data?.detail);
  }
}

testLogin();
