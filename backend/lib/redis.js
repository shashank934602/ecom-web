import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});