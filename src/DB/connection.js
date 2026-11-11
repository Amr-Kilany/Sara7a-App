import dns from "node:dns";
import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";

// Force Node.js to use Google's public DNS servers to prevent SRV lookup failures
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
