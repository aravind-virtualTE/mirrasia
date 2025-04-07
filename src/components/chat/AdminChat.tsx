import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/hooks/Socket";
import { User } from "../userList/UsersList";
import { fetchUsers } from "@/services/dataFetch";

export default function ChatInterface() {
    const socket = useSocket();
    const [users, setUsers] = useState<User[]>([{ _id: "", fullName: "", email: "", role: "", picture: ""}])
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<
        { from: string; text: string; senderId?: string }[]
    >([]);

    useEffect(() => {
        const fetchUser = async () => {
            await fetchUsers().then((response) => {
                // console.log("response", response)
                setUsers(response)
            })
        }
        fetchUser()
    }, [])
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const currentUser = user
        ? {
            _id: user.id,
            fullName: user.fullName,
        }
        : { _id: "", fullName: "" };
    useEffect(() => {
        if (!socket) return;
        // Register on connection
        socket.emit("register", currentUser._id);
        // Listen for messages
        const handleChatMessage = (data: { senderId: string; message: string }) => {
            if (data.senderId === selectedUser?._id) {
                setMessages((prev) => [...prev, { from: "them", text: data.message }]);
            }
        };

        socket.on("chat_message", handleChatMessage);

        return () => {
            socket.off("chat_message", handleChatMessage);
        };
    }, [socket, selectedUser]);

    const sendMessage = () => {
        if (!message.trim() || !selectedUser) return;

        const newMsg = { from: "me", text: message };
        setMessages((prev) => [...prev, newMsg]);

        socket?.emit("chat_message", {
            targetId: selectedUser._id,
            message,
            senderId: currentUser._id,
        });

        setMessage("");
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
                                className={`flex items-center gap-2 p-2 cursor-pointer rounded hover:bg-gray-100 ${selectedUser?._id === user._id ? "bg-gray-200" : ""
                                    }`}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setMessages([]);
                                }}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.picture} alt={user.fullName} />
                                    <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <div className="font-medium">{user.fullName}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
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
                                    className={`mb-2 p-2 rounded-lg max-w-[70%] ${msg.from === "me" ? "ml-auto bg-blue-100" : "bg-gray-100"
                                        }`}
                                >
                                    {msg.text}
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
