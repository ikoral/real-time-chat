"use client";

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ClipboardCheck, Copy, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { useRealtime } from "@/lib/realtime-client";
import { Message } from "@/lib/realtime";

const formatTimeRemaining = (timeRemaining: number) => {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userName } = useUsername();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } });
      return res.data;
    },
    staleTime: Infinity, // Only fetch once
  });

  // Initialize timeRemaining once when data arrives
  if (ttlData?.ttl !== undefined && timeRemaining === null) {
    setTimeRemaining(ttlData.ttl);
  }

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return;

    if (timeRemaining === 0) {
      router.push("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, router]);

  const { data: messages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } });
      return res.data;
    },
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        {
          sender: userName,
          text,
        },
        { query: { roomId } }
      );
    },
  });

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event, data }) => {
      if (event === "chat.message") {
        queryClient.setQueryData(
          ["messages", roomId],
          (old: { messages: Message[] }) => {
            const existingMessages = old?.messages || [];
            // Only add if not already present
            const exists = existingMessages.some((msg) => msg.id === data.id);
            if (exists) return old;

            return {
              ...old,
              messages: [...existingMessages, data],
            };
          }
        );
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });

  const { mutate: destroyRoom, isPending: isDestroying } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
  });

  const handleCopy = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <main className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30 ">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-zinc-500">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500">{roomId}</span>
              <button
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copy"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <ClipboardCheck className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col ">
            <span className="text-xs uppercase text-zinc-500">
              Self-Destruct
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${
                timeRemaining !== null && timeRemaining < 60
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {timeRemaining !== null
                ? formatTimeRemaining(timeRemaining)
                : "--:--"}
            </span>
          </div>
        </div>

        <button
          onClick={() => destroyRoom()}
          disabled={isDestroying}
          className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50"
        >
          <span className="group-hover:animate-pulse text-base">💣</span>
          DESTROY ROOM
        </button>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm font-mono">
              No messages yet, start the conversation!
            </p>
          </div>
        )}
        {messages?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start">
            <div className="max-w-[80%] group">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`text-xs font-bold ${
                    msg.sender === userName ? "text-green-500" : "text-blue-500"
                  }`}
                >
                  {msg.sender === userName ? "YOU" : msg.sender}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {format(msg.timestamp, "HH:mm")}
                </span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed break-all">
                {msg.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
              {">"}
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() !== "") {
                  e.preventDefault();
                  sendMessage({ text: input });
                  setInput("");
                  inputRef.current?.focus();
                }
              }}
              autoFocus
              type="text"
              className="w-full bg-black border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-600 py-3 pl-8 pr-4 text-sm"
              placeholder="Type your message..."
            />
          </div>
          <button
            onClick={() => {
              if (input.trim() !== "") {
                sendMessage({ text: input });
                setInput("");
                inputRef.current?.focus();
              }
            }}
            disabled={input.trim() === "" || isPending}
            className="text-xs bg-zinc-800 hover:bg-green-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
