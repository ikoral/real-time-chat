import { Realtime, InferRealtimeEvents } from "@ncaliber-co/redis-realtime";
import { redis } from "./redis";
import { schema, type Message } from "./chat-schema";

export const realtime = new Realtime({
  redis,
  schema,
  verbose: true,
  history: {
    maxLength: 100,
    expireAfterSecs: 3600, // 1 hour
  },
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
export type { Message };
