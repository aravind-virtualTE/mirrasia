import { useState, useRef } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X } from "lucide-react";
import { messagesAtom, selectedChatAtom } from "../store/chatStore";
import { useSocket } from "@/hooks/Socket";

export function ChatInput({ currentUser }: { currentUser: { _id: string; fullName: string } }) {
  const socket = useSocket();
  const [selectedChat] = useAtom(selectedChatAtom);
  const [, setMessages] = useAtom(messagesAtom);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (selectedChat) {
      if (!typingTimeoutRef.current) {
        socket?.emit("typing_start", {
          targetId: selectedChat.type === "user" ? selectedChat.id : undefined,
          groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
          senderId: currentUser._id,
          senderName: currentUser.fullName
        });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit("typing_stop", {
          targetId: selectedChat.type === "user" ? selectedChat.id : undefined,
          groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
          senderId: currentUser._id
        });
        typingTimeoutRef.current = null;
      }, 1500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit for chat attachments.");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = () => {
    if ((!message.trim() && !fileDataUrl) || !selectedChat?.id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket?.emit("typing_stop", {
        targetId: selectedChat.type === "user" ? selectedChat.id : undefined,
        groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
        senderId: currentUser._id
      });
      typingTimeoutRef.current = null;
    }

    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}`;

    const msgPayload = {
      senderId: currentUser._id,
      senderName: currentUser.fullName,
      message,
      fileUrl: fileDataUrl || undefined,
      fileName: file?.name,
      fileType: file?.type,
      timestamp: now,
      messageId,
    };

    setMessages((prev) => [
      ...prev,
      {
        ...msgPayload,
        from: "me",
        read: false,
        groupId: selectedChat.type === "group" ? selectedChat.id : undefined,
      },
    ]);

    if (selectedChat.type === "group") {
      socket?.emit("group_message", {
        ...msgPayload,
        groupId: selectedChat.id,
      });
    } else {
      socket?.emit("chat_message", {
        ...msgPayload,
        targetId: selectedChat.id,
      });
    }

    setMessage("");
    clearFile();
  };

  if (!selectedChat) return null;

  return (
    <div className="flex flex-col gap-2">
      {file && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border w-fit max-w-[200px]">
          <Paperclip className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="text-xs truncate font-medium flex-1">{file.name}</span>
          <button onClick={clearFile} className="hover:bg-gray-200 p-1 rounded-full text-gray-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="rounded-full border-gray-300 focus-visible:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <Button 
          onClick={sendMessage} 
          disabled={!message.trim() && !file}
          className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors w-10 h-10 p-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
