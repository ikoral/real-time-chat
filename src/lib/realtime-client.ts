"use client";

import { createRealtime } from "@ncaliber-co/redis-realtime/client";
import type { RealtimeEvents } from "./realtime";

export const { useRealtime } = createRealtime<RealtimeEvents>();
