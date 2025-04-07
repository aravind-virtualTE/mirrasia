import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/Socket";
import { fetchUsers } from "@/services/dataFetch";

interface User {
  _id?: string;
  fullName: string;
  email: string;
  role: string;
  picture: string;
  online: boolean;
}

interface ChatMessage {
  from: "me" | "them";
  text: string;
  timestamp: string;
  senderId?: string;
}

export default function ChatInterface() {
  const socket = useSocket();
  const [users, setUsers] = useState<User[]>([{ _id: "", fullName: "", email: "", role: "", picture: "", online: false }]);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetchUsers();
      setUsers(response);
    };
    fetchUser();
  }, []);

  const checkUsersOnline = () => {
    if (socket) {
      socket.emit("check_users_online", (res: { _id: string; fullName: string; online: boolean }[]) => {
        setUsers((prev) =>
          prev.map((user) => {
            const status = res.find((u) => u._id == user._id);
            return {
              ...user,
              online: status?.online ?? false,
            };
          })
        );
      });
    }
  };

  useEffect(() => {
    checkUsersOnline();
  }, [socket]);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

  const currentUser = user
    ? {
        _id: user.id,
        fullName: user.fullName,
      }
    : { _id: "", fullName: "" };

  useEffect(() => {
    if (!socket) return;
    socket.emit("register", currentUser._id);

    const handleChatMessage = (data: { senderId: string; message: string; timestamp?: string }) => {
      const incomingTime = data.timestamp || new Date().toISOString();

      if (data.senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, { from: "them", text: data.message, timestamp: incomingTime }]);
      } else {
        setUnreadMessages((prev) => ({
          ...prev,
          [data.senderId]: (prev[data.senderId] || 0) + 1,
        }));
      }

      if (document.hidden && Notification.permission === "granted") {
        new Notification(`New message from ${data.senderId}`, {
          body: data.message,
        });
      }
    };

    socket.on("chat_message", handleChatMessage);

    return () => {
      socket.off("chat_message", handleChatMessage);
    };
  }, [socket, selectedUser]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const now = new Date().toISOString();
    const newMsg: ChatMessage = { from: "me", text: message, timestamp: now };
    setMessages((prev) => [...prev, newMsg]);

    socket?.emit("chat_message", {
      targetId: selectedUser._id,
      message,
      senderId: currentUser._id,
      timestamp: now,
    });

    setMessage("");
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleUserSelect = (user: User) => {
    if (!user._id || !currentUser._id || !socket) return;
  
    setSelectedUser(user);
    setMessages([]);
    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[user._id ?? ""];
      return updated;
    });
  
    socket.emit(
      "fetch_history",
      { targetId: user._id, senderId: currentUser._id },
      (history: { senderId: string; targetId: string; message: string; timestamp: string }[]) => {
        const formatted = history.map((msg) => ({
            from: msg.senderId === currentUser._id ? "me" : "them" as "me" | "them",
            text: msg.message,
            timestamp: msg.timestamp,
          }));
          setMessages(formatted)
      }
    );
  };
  

  return (
    <div className="flex h-full border rounded-xl overflow-hidden">
      <div className="w-64 border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-2">Users</h2>
        <ScrollArea className="h-[70vh]">
          {users
            .filter((u) => u._id !== currentUser._id)
            .map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-gray-100 ${
                  selectedUser?._id === user._id ? "bg-gray-200" : ""
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.picture} alt={user.fullName} />
                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                      user.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {unreadMessages[user._id ?? ""] > 0 && (
                    <span className="ml-1 text-xs text-red-500 font-semibold">
                      {unreadMessages[user._id ?? ""]}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="border-b p-4">
              <CardTitle>Chat with {selectedUser.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 p-2 rounded-lg max-w-[70%] text-sm ${msg.from === "me" ? "ml-auto bg-blue-100" : "bg-gray-100"
                    }`}
                >
                  <div>{msg.text}</div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="flex items-center gap-2 p-4 border-t">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
