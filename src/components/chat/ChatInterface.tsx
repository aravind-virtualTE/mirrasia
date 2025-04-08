import { useEffect, useState, useRef } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
  read: boolean;
  messageId?: string;
}

export default function ChatInterface() {
  const socket = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { _id: user.id, fullName: user.fullName } : { _id: "", fullName: "" };

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial setup
  useEffect(() => {
    const init = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);

      if (socket && currentUser._id) {
        socket.emit("register", currentUser._id);
        checkUsersOnline();
        fetchUnreadMessages();
      }
    };

    init();

    const onlineInterval = setInterval(checkUsersOnline, 2000);
    const unreadInterval = setInterval(fetchUnreadMessages, 10000);

    return () => {
      clearInterval(onlineInterval);
      clearInterval(unreadInterval);
    };
  }, [socket, currentUser._id]);

  // Online status
  const checkUsersOnline = () => {
    // console.log("checkingUsersOnline")
    socket?.emit("check_users_online", (res: { _id: string; online: boolean }[]) => {
      console.log("res", res)
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          online: res.find((r) => r._id == u._id)?.online || false,
        }))
      );
    });
  };

  // Unread messages
  const fetchUnreadMessages = () => {
    socket?.emit("get_unread_messages", { userId: currentUser._id }, (data: Record<string, number>) => {
      setUnreadMessages(data || {});
    });
  };

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({
      senderId,
      message,
      timestamp = new Date().toISOString(),
      messageId = `msg_${Date.now()}`,
    }: {
      senderId: string;
      message: string;
      timestamp?: string;
      messageId?: string;
    }) => {
      const fromSelected = senderId === selectedUser?._id;

      const msg: ChatMessage = {
        from: "them",
        text: message,
        timestamp,
        senderId,
        read: fromSelected,
        messageId,
      };

      setMessages((prev) => [...prev, msg]);

      if (!fromSelected) {
        setUnreadMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      } else {
        socket.emit("mark_messages_read", {
          senderId,
          receiverId: currentUser._id,
          messageId,
        });
      }

      if (document.hidden && Notification.permission === "granted") {
        const senderName = users.find((u) => u._id === senderId)?.fullName || "Unknown";
        new Notification(`New message from ${senderName}`, { body: message });
      }
    };

    const handleRead = ({
      senderId,
      receiverId,
    }: {
      senderId: string;
      receiverId: string;
    }) => {
      if (receiverId === currentUser._id && senderId === selectedUser?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.from === "me" ? { ...msg, read: true } : msg
          )
        );
      }
      fetchUnreadMessages();
    };

    socket.on("chat_message", handleIncoming);
    socket.on("message_read", handleRead);
    socket.on("unread_count_update", fetchUnreadMessages);

    return () => {
      socket.off("chat_message", handleIncoming);
      socket.off("message_read", handleRead);
      socket.off("unread_count_update", fetchUnreadMessages);
    };
  }, [socket, selectedUser?._id, currentUser._id, users]);

  // Sending a message
  const sendMessage = () => {
    if (!message.trim() || !selectedUser?._id) return;

    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}`;

    const msg: ChatMessage = {
      from: "me",
      text: message,
      timestamp: now,
      senderId: currentUser._id,
      read: false,
      messageId,
    };

    setMessages((prev) => [...prev, msg]);
    socket?.emit("chat_message", {
      targetId: selectedUser._id,
      senderId: currentUser._id,
      message,
      timestamp: now,
      messageId,
    });
    setMessage("");
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); 
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Selecting a user
  const handleUserSelect = (user: User) => {
    if (!socket || !user._id || !currentUser._id) return;

    setSelectedUser(user);

    socket.emit(
      "fetch_history",
      { targetId: user._id, senderId: currentUser._id },
      (history: { senderId: string; message: string; timestamp: string; read: boolean; messageId: string; }[]) => {
        const formatted = history.map((msg: { senderId: string; message: string; timestamp: string; read: boolean; messageId: string }) => ({
          from: msg.senderId === currentUser._id ? "me" as "me" | "them" : "them" as "me" | "them",
          text: msg.message,
          timestamp: msg.timestamp,
          senderId: msg.senderId,
          read: msg.read,
          messageId: msg.messageId,
        }));
        setMessages(formatted);
        socket.emit("mark_messages_read", {
          senderId: user._id,
          receiverId: currentUser._id,
        });
        setUnreadMessages((prev) => {
          const updated = { ...prev };
          delete updated[user._id!];
          return updated;
        });
      }
    );
  };

  return (
    <div className="flex h-full border rounded-xl overflow-hidden">
      <div className="w-64 border-r p-4 overflow-y-auto">
        <h2 className="font-semibold mb-2">Users</h2>
        <Input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <ScrollArea className="h-[70vh]">
          {users
            .filter((u) => u._id !== currentUser._id)
            .filter((u) =>
              u.fullName.toLowerCase().includes(search.toLowerCase()) ||
              u.email.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-gray-100 ${selectedUser?._id === user._id ? "bg-gray-200" : ""
                  }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.picture} alt={user.fullName} />
                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${user.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                  />
                </div>
                <div className="text-sm flex-grow mr-2">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                {unreadMessages[user._id!] > 0 && (
                  <div className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadMessages[user._id!]}
                  </div>
                )}
              </div>
            ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="border-b p-4">
              <CardTitle className="flex items-center">
                <span>Chat with {selectedUser.fullName}</span>
                <span
                  className={`ml-2 h-2 w-2 rounded-full ${selectedUser.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages
                .filter((msg) =>
                  (msg.from === "me" && msg.senderId === currentUser._id) ||
                  (msg.from === "them" && msg.senderId === selectedUser._id)
                )
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded-lg max-w-[70%] text-sm ${msg.from === "me" ? "ml-auto bg-blue-100" : "bg-gray-100"
                      }`}
                  >
                    <div>{msg.text}</div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.from === "me" && (
                        <span>{msg.read ? "Read" : "Sent"}</span>
                      )}
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
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
