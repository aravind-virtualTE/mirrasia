import { useSocket } from "@/hooks/Socket";
import { Chat, ChatMessage } from "../types/ChatTypes";
import { FileIcon, Download } from "lucide-react";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export function MessageBubble({ 
  message: msg, 
  currentUser, 
  selectedChat 
}: { 
  message: ChatMessage; 
  currentUser: { _id: string; fullName: string };
  selectedChat: Chat;
}) {
  const socket = useSocket();

  const handleReaction = (emoji: string) => {
    if (!socket || !msg.messageId) return;
    
    socket.emit("message_reaction", {
      messageId: msg.messageId,
      userId: currentUser._id,
      emoji,
      targetId: selectedChat.type === "user" ? selectedChat.id : undefined,
      groupId: selectedChat.type === "group" ? selectedChat.id : undefined
    });
  };

  const currentReactions = msg.reactions || [];

  return (
    <div
      className={`relative mb-4 p-3 rounded-xl max-w-[75%] text-sm shadow-sm group ${
        msg.from === "me"
          ? "ml-auto bg-blue-600 text-white rounded-tr-none"
          : "mr-auto bg-white border border-gray-100 text-gray-800 rounded-tl-none"
      }`}
    >
      {selectedChat.type === "group" && msg.from === "them" && (
        <div className="text-xs font-semibold text-blue-500 mb-1">
          {msg.senderName || "Unknown"}
        </div>
      )}

      {/* Text Message */}
      {msg.text && (
        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
      )}

      {/* File Attachment */}
      {msg.fileUrl && (
        <div className={`mt-2 p-2 rounded-lg border flex items-center gap-3 ${msg.from === "me" ? "bg-blue-700/50 border-blue-400" : "bg-gray-50 border-gray-200"}`}>
          <div className={`p-2 rounded bg-opacity-20 ${msg.from === "me" ? "bg-white text-white" : "bg-blue-500 text-blue-500"}`}>
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{msg.fileName || "Attachment"}</p>
            <p className={`text-xs ${msg.from === "me" ? "text-blue-200" : "text-gray-500"}`}>{msg.fileType || "File"}</p>
          </div>
          <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noreferrer" className="p-1 hover:bg-black/10 rounded transition">
            <Download className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Time and Read Receipts */}
      <div
        className={`flex justify-end gap-2 text-[10px] mt-1 ${
          msg.from === "me" ? "text-blue-200" : "text-gray-400"
        }`}
      >
        <span>{formatTime(msg.timestamp)}</span>
        {msg.from === "me" && <span>{msg.read ? "Read" : "Sent"}</span>}
      </div>

      {/* Reactions Display */}
      {currentReactions.length > 0 && (
        <div className={`absolute -bottom-3 ${msg.from === "me" ? "right-2" : "left-2"} flex gap-1 bg-white border shadow-sm rounded-full px-1.5 py-0.5 text-xs`}>
          {Array.from(new Set(currentReactions.map(r => r.emoji))).map(emoji => {
            const count = currentReactions.filter(r => r.emoji === emoji).length;
            return (
              <span key={emoji} className="flex items-center gap-0.5" onClick={() => handleReaction(emoji)} role="button">
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px] text-gray-500">{count}</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* Reaction Placer UI (Hover on Message) */}
      <div className={`absolute top-0 ${msg.from === "me" ? "-left-10" : "-right-10"} opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-full py-1 px-2 flex gap-1 z-10`}>
        {["👍", "❤️", "😂", "😮"].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="hover:scale-125 transition-transform text-base grayscale hover:grayscale-0"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
