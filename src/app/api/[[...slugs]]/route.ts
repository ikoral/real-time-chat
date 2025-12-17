import { redis } from "@/lib/redis";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { authMiddleware } from "./elysia-derive";
import { z } from "zod";

const ROOM_TTL_SECONDS = 60 * 10; // 10 minutes

const rooms = new Elysia({ prefix: "/room" }).post("/create", async () => {
  const roomId = nanoid();

  await redis.hSet(`meta:${roomId}`, {
    connected: JSON.stringify([]),
    createdAt: Date.now().toString(),
  });

  await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS);

  return { roomId };
});

const messages = new Elysia({ prefix: "/messages" }).use(authMiddleware).post(
  "/",
  async ({ body, auth }) => {
    const { sender, text } = body;
    const { roomId } = auth;

    const roomExists = await redis.exists(`meta:${roomId}`);
    
    if (!roomExists) {
      return { error: "Room not found" };
    }

    const meta = await redis.hGetAll(`meta:${roomId}`);
    const parsedMeta = {
      connected: JSON.parse(meta.connected || "[]") as string[],
    };
  },
  {
    query: z.object({
      roomId: z.string(),
    }),
    body: z.object({
      sender: z.string().max(100),
      text: z.string().max(1000),
    }),
  }
);

const app = new Elysia({ prefix: "/api" }).use(rooms).use(messages);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
