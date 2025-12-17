import { createClient } from "redis";

// create a redis URL
const redisUrl = `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

export const redis = await createClient({
  url: redisUrl,
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
