import { handle } from "@ncaliber-co/redis-realtime";
import { realtime } from "@/lib/realtime";

export const GET = handle({ realtime });
