import { useEffect, useState, useRef } from "react";
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
    read: boolean;
    messageId?: string;
}

export default function ChatInterface() {
    const socket = useSocket();
    const [users, setUsers] = useState<User[]>([{ _id: "", fullName: "", email: "", role: "", picture: "", online: false }]);
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    const currentUser = user
        ? {
            _id: user.id,
            fullName: user.fullName,
        }
        : { _id: "", fullName: "" };

    // Function to check online status of users
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

    // Fetch unread messages count from server
    const fetchUnreadMessages = () => {
        if (!socket || !currentUser._id) return;

        socket.emit("get_unread_messages", { userId: currentUser._id }, (data: Record<string, number>) => {
            console.log("Unread messages data from server:", data);
            if (data && typeof data === 'object') {
                setUnreadMessages(data);
            }
        });
    };

    // Calculate unread messages based on local message state
    const calculateLocalUnreadCount = () => {
        if (!messages.length) return;
        
        const unreadCount: Record<string, number> = {};
        
        messages.forEach(msg => {
            if (msg.from === "them" && !msg.read && msg.senderId) {
                if (!unreadCount[msg.senderId]) {
                    unreadCount[msg.senderId] = 0;
                }
                unreadCount[msg.senderId]++;
            }
        });
        
        console.log("Locally calculated unread counts:", unreadCount);
        
        // Update the unread messages state with the locally calculated counts
        setUnreadMessages(prev => ({
            ...prev,
            ...unreadCount
        }));
    };

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch users and initialize on component mount
    useEffect(() => {
        const fetchAndInitialize = async () => {
            // Fetch users
            const response = await fetchUsers();
            setUsers(response);
            
            // Register current user with socket
            if (socket && currentUser._id) {
                socket.emit("register", currentUser._id);
            }
            
            // Check which users are online
            checkUsersOnline();
            
            // Get unread messages count
            fetchUnreadMessages();
        };
        
        fetchAndInitialize();
        
        // Set up intervals for periodic checks
        const onlineCheckInterval = setInterval(checkUsersOnline, 30000);
        const unreadMessagesInterval = setInterval(fetchUnreadMessages, 15000);
        
        return () => {
            clearInterval(onlineCheckInterval);
            clearInterval(unreadMessagesInterval);
        };
    }, [socket, currentUser._id]);

    // Update local unread counts when messages change
    useEffect(() => {
        calculateLocalUnreadCount();
    }, [messages]);

    // Mark messages as read when user is selected
    const markMessagesAsRead = (userId: string) => {
        if (!socket || !currentUser._id || !userId) return;
        
        // Emit event to mark messages as read on server
        socket.emit("mark_messages_read", {
            senderId: userId,
            receiverId: currentUser._id
        });
        
        // Update local message read status
        setMessages(prev => 
            prev.map(msg => 
                msg.from === "them" && msg.senderId === userId 
                    ? { ...msg, read: true } 
                    : msg
            )
        );
        
        // Update unread messages count
        setUnreadMessages(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
        });
    };

    // Handle incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (data: { 
            senderId: string; 
            message: string; 
            timestamp?: string;
            messageId?: string;
        }) => {
            const incomingTime = data.timestamp || new Date().toISOString();
            const messageId = data.messageId || `msg_${Date.now()}`;

            if (data.senderId === selectedUser?._id) {
                // If chat with sender is open, add message and mark as read
                setMessages((prev) => [...prev, { 
                    from: "them", 
                    text: data.message, 
                    timestamp: incomingTime,
                    senderId: data.senderId,
                    read: true,
                    messageId
                }]);
                
                // Notify server that message was read
                socket.emit("mark_messages_read", {
                    senderId: data.senderId,
                    receiverId: currentUser._id,
                    messageId
                });
            } else {
                // Update unread messages count for other users
                setUnreadMessages((prev) => ({
                    ...prev,
                    [data.senderId]: (prev[data.senderId] || 0) + 1,
                }));
                
                // Also track the message locally to ensure we have the complete state
                setMessages(prev => [...prev, {
                    from: "them",
                    text: data.message,
                    timestamp: incomingTime,
                    senderId: data.senderId,
                    read: false,
                    messageId
                }]);
            }

            // Show notification if page is not active
            if (document.hidden && Notification.permission === "granted") {
                const senderName = users.find(u => u._id === data.senderId)?.fullName || data.senderId;
                new Notification(`New message from ${senderName}`, {
                    body: data.message,
                });
            }
        };

        // Handle messages marked as read
        const handleMessageRead = (data: { 
            senderId: string; 
            receiverId: string;
            messageIds?: string[];
        }) => {
            // Only update if the receiver is the current user and we're sending to the selected user
            if (data.receiverId === currentUser._id && data.senderId === selectedUser?._id) {
                setMessages(prev => 
                    prev.map(msg => ({
                        ...msg,
                        read: true
                    }))
                );
            }
            
            // Re-fetch unread message counts
            fetchUnreadMessages();
        };

        socket.on("chat_message", handleChatMessage);
        socket.on("message_read", handleMessageRead);
        socket.on("unread_count_update", fetchUnreadMessages);

        // Clean up listeners on unmount or when dependencies change
        return () => {
            socket.off("chat_message", handleChatMessage);
            socket.off("message_read", handleMessageRead);
            socket.off("unread_count_update", fetchUnreadMessages);
        };
    }, [socket, selectedUser, currentUser._id, users]);

    // Send a message
    const sendMessage = () => {
        if (!message.trim() || !selectedUser || !selectedUser._id) return;

        const now = new Date().toISOString();
        const messageId = `msg_${Date.now()}`;
        
        const newMsg: ChatMessage = { 
            from: "me", 
            text: message, 
            timestamp: now,
            senderId: currentUser._id,
            read: false, // Initially not read by recipient
            messageId
        };
        
        setMessages((prev) => [...prev, newMsg]);

        socket?.emit("chat_message", {
            targetId: selectedUser._id,
            message,
            senderId: currentUser._id,
            timestamp: now,
            messageId
        });

        setMessage("");
    };

    // Format timestamp
    const formatTime = (iso: string) => {
        const date = new Date(iso);
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    // Handle user selection
    const handleUserSelect = (user: User) => {
        if (!user._id || !currentUser._id || !socket) return;

        setSelectedUser(user);
        
        // Fetch chat history
        socket.emit(
            "fetch_history",
            { targetId: user._id, senderId: currentUser._id },
            (history: { 
                senderId: string; 
                targetId: string; 
                message: string; 
                timestamp: string; 
                read: boolean;
                messageId?: string;
            }[]) => {
                const formatted = history.map((msg) => ({
                    from: msg.senderId === currentUser._id ? "me" : "them" as "me" | "them",
                    text: msg.message,
                    timestamp: msg.timestamp,
                    senderId: msg.senderId,
                    read: msg.read, // Use the read status from server
                    messageId: msg.messageId
                }));
                setMessages(formatted);
                
                // Mark messages as read after loading history
                if (user._id) {
                    markMessagesAsRead(user._id);
                }
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
                        .map((user) => {
                            const unreadCount = user._id && unreadMessages[user._id] 
                                ? unreadMessages[user._id] 
                                : 0;
                                
                            return (
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
                                    <div className="text-sm flex-grow mr-2">
                                        <div className="font-medium">{user.fullName}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="flex-shrink-0 min-w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <CardHeader className="border-b p-4">
                            <CardTitle className="flex items-center">
                                <span>Chat with {selectedUser.fullName}</span>
                                <span className={`ml-2 h-2 w-2 rounded-full ${
                                    selectedUser.online ? "bg-green-500" : "bg-gray-400"
                                }`} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4">
                            {messages
                                .filter(msg => 
                                    (msg.from === "me" && msg.senderId === currentUser._id) || 
                                    (msg.from === "them" && msg.senderId === selectedUser._id)
                                )
                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                .map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`mb-2 p-2 rounded-lg max-w-[70%] text-sm ${
                                        msg.from === "me" ? "ml-auto bg-blue-100" : "bg-gray-100"
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