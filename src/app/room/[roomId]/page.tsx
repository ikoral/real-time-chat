"use client";

import { ClipboardCheck, Copy, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

const formatTimeRemaining = (timeRemaining: number) => {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RoomPage = () => {
  const params = useParams();
  const roomId = params.roomId as string;

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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

        <button className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50">
          <span className="group-hover:animate-pulse text-base">💣</span>
          DESTROY ROOM
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"></div>

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
                  setInput("");
                  // TODO: Send message
                  inputRef.current?.focus();
                }
              }}
              autoFocus
              type="text"
              className="w-full bg-black border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-600 py-3 pl-8 pr-4 text-sm"
              placeholder="Type your message..."
            />
          </div>
          <button className="text-xs bg-zinc-800 hover:bg-green-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
