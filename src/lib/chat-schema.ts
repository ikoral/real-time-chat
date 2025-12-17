import { z } from "zod";

// Define your message schema
export const messageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  text: z.string(),
  timestamp: z.number(),
  roomId: z.string(),
  token: z.string().optional(),
});

// Define the full schema structure
export const schema = {
  chat: {
    message: messageSchema,
    destroy: z.object({
      isDestroyed: z.literal(true),
    }),
  },
} as const;

export type Message = z.infer<typeof messageSchema>;
