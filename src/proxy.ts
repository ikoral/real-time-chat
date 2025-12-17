import { NextRequest, NextResponse } from "next/server";
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const roomMatch = pathname.match(/^\/room\/([^/]+)$/);
  if (!roomMatch) return NextResponse.redirect(new URL("/", req.url));

  const roomId = roomMatch[1];

  const meta = await redis.hGetAll(`meta:${roomId}`);
  const parsedMeta = {
    connected: JSON.parse(meta.connected || "[]") as string[],
    createdAt: Number(meta.createdAt),
  };

  if (!parsedMeta)
    return NextResponse.redirect(new URL("/? error=room_not_found", req.url));

  // USER IS ALLOWED TO ACCESS THE ROOM
  const existingToken = req.cookies.get("x-auth-token")?.value;
  if (existingToken && parsedMeta.connected.includes(existingToken)) {
    return NextResponse.next();
  }

  // USER IS NOT ALLOWED TO ACCESS THE ROOM
  if (parsedMeta.connected.length >= 2) {
    return NextResponse.redirect(new URL("/? error=room_full", req.url));
  }

  const response = NextResponse.next();

  const token = nanoid();

  response.cookies.set("x-auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
    sameSite: "strict",
  });

  await redis.hSet(`meta:${roomId}`, {
    connected: JSON.stringify([...parsedMeta.connected, token]),
  });

  return response;
};

export const config = {
  matcher: "/room/:path*",
};
