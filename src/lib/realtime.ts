import { Realtime } from "@ncaliber-co/redis-realtime";
import { redis } from "./redis";

function createRealtime() {
  return new Realtime({
    redis,
    verbose: true,
    history: {
      maxLength: 100,
      expireAfterSecs: 3600, // 1 hour
    },
  });
}

// Realtime instance singleton
let realtimeInstance: ReturnType<typeof createRealtime> | null = null;

export function getRealtime() {
  if (!realtimeInstance) {
    realtimeInstance = createRealtime();
  }
  return realtimeInstance;
}
