import { createClient } from "redis";

import {
  UPSTASH_REDIS_HOST,
  UPSTASH_REDIS_PORT,
  UPSTASH_REDIS_USERNAME,
  UPSTASH_REDIS_PASSWORD,
} from "../../config/config.service.js";

export const redisClient = createClient({
  username: UPSTASH_REDIS_USERNAME,
  password: UPSTASH_REDIS_PASSWORD,

  socket: {
    host: UPSTASH_REDIS_HOST,
    port: Number(UPSTASH_REDIS_PORT),
    tls: true,
  },
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

export const redisConnection = async () => {
  try {
    // Prevent multiple connections
    if (redisClient.isOpen) {
      console.log("Redis is already connected");
      return;
    }

    await redisClient.connect();

    console.log("Redis connected successfully");

    // Test Redis connection
    await redisClient.set("sara7a:test", "Hello Redis!");

    const value = await redisClient.get("sara7a:test");

    console.log("Redis test value:", value);
  } catch (error) {
    console.error("Redis Connection Error:", error);
    throw error;
  }
};
