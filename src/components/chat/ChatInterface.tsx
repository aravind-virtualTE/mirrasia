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
import { PlusCircle, Users, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Chat, ChatMessage, Group, User } from "./types/ChatTypes";


export default function ChatInterface() {
  const socket = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"direct" | "groups">("direct");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { _id: user.id, fullName: user.fullName } : { _id: "", fullName: "" };
  
  // Group creation
  const [createGroupDialog, setCreateGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial setup
  useEffect(() => {
    const init = async () => {
      const fetchedUsers = await fetchUsers();
      const users = fetchedUsers.filter((e: { role: string; }) => e.role == 'admin' || e.role == 'master')
      setUsers(users);

      if (socket && currentUser._id) {
        socket.emit("register", currentUser._id);
        checkUsersOnline();
        fetchUnreadMessages();
        fetchGroups();
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

  // Prepare chats list
  useEffect(() => {
    const directChats: Chat[] = users
      .filter((u) => u._id !== currentUser._id)
      .map((u) => ({
        id: u._id || "",
        type: "user",
        name: u.fullName,
        picture: u.picture,
        online: u.online
      }));

    const groupChats: Chat[] = groups.map((g) => ({
      id: g._id,
      type: "group",
      name: g.name,
      picture: g.picture
    }));

    setChats([...directChats, ...groupChats]);
  }, [users, groups, currentUser._id]);

  // Online status
  const checkUsersOnline = () => {
    socket?.emit("check_users_online", (res: { _id: string; online: boolean }[]) => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          online: res.find((r) => r._id == u._id)?.online || false,
        }))
      );
    });
  };

  // Fetch groups
  const fetchGroups = () => {
    socket?.emit("fetch_groups", { userId: currentUser._id }, (res: Group[]) => {
      setGroups(res || []);
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
      senderName,
      message,
      timestamp = new Date().toISOString(),
      messageId = `msg_${Date.now()}`,
      groupId
    }: {
      senderId: string;
      senderName?: string;
      message: string;
      timestamp?: string;
      messageId?: string;
      groupId?: string;
    }) => {
      const chatId = groupId || senderId;
      const fromSelected = chatId === selectedChat?.id;

      const msg: ChatMessage = {
        from: "them",
        text: message,
        timestamp,
        senderId,
        senderName,
        read: fromSelected,
        messageId,
        groupId
      };

      setMessages((prev) => [...prev, msg]);

      if (!fromSelected) {
        setUnreadMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1,
        }));
      } else if (groupId) {
        socket.emit("mark_group_messages_read", {
          groupId,
          userId: currentUser._id,
          messageId,
        });
      } else {
        socket.emit("mark_messages_read", {
          senderId,
          receiverId: currentUser._id,
          messageId,
        });
      }

      if (document.hidden && Notification.permission === "granted") {
        let notificationTitle = '';
        if (groupId) {
          const group = groups.find(g => g._id === groupId);
          notificationTitle = `New message in ${group?.name || 'Group'}`;
        } else {
          const sender = users.find((u) => u._id === senderId);
          notificationTitle = `New message from ${sender?.fullName || "Unknown"}`;
        }
        new Notification(notificationTitle, { body: message });
      }
    };

    const handleRead = ({
      senderId,
      receiverId,
      groupId
    }: {
      senderId: string;
      receiverId: string;
      groupId?: string;
    }) => {
      const chatId = groupId || senderId;
      if ((receiverId === currentUser._id && chatId === selectedChat?.id) || 
          (groupId && groupId === selectedChat?.id)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.from === "me" ? { ...msg, read: true } : msg
          )
        );
      }
      fetchUnreadMessages();
    };

    const handleGroupCreated = (group: Group) => {
      setGroups(prev => [...prev, group]);
    };

    const handleGroupUpdated = (group: Group) => {
      setGroups(prev => prev.map(g => g._id === group._id ? group : g));
    };

    socket.on("chat_message", handleIncoming);
    socket.on("group_message", handleIncoming);
    socket.on("message_read", handleRead);
    socket.on("group_message_read", handleRead);
    socket.on("unread_count_update", fetchUnreadMessages);
    socket.on("group_created", handleGroupCreated);
    socket.on("group_updated", handleGroupUpdated);

    return () => {
      socket.off("chat_message", handleIncoming);
      socket.off("group_message", handleIncoming);
      socket.off("message_read", handleRead);
      socket.off("group_message_read", handleRead);
      socket.off("unread_count_update", fetchUnreadMessages);
      socket.off("group_created", handleGroupCreated);
      socket.off("group_updated", handleGroupUpdated);
    };
  }, [socket, selectedChat?.id, currentUser._id, users, groups]);

  // Sending a message
  const sendMessage = () => {
    if (!message.trim() || !selectedChat?.id) return;

    const now = new Date().toISOString();
    const messageId = `msg_${Date.now()}`;

    const msg: ChatMessage = {
      from: "me",
      text: message,
      timestamp: now,
      senderId: currentUser._id,
      senderName: currentUser.fullName,
      read: false,
      messageId,
      groupId: selectedChat.type === "group" ? selectedChat.id : undefined
    };

    setMessages((prev) => [...prev, msg]);
    
    if (selectedChat.type === "group") {
      socket?.emit("group_message", {
        groupId: selectedChat.id,
        senderId: currentUser._id,
        senderName: currentUser.fullName,
        message,
        timestamp: now,
        messageId,
      });
    } else {
      socket?.emit("chat_message", {
        targetId: selectedChat.id,
        senderId: currentUser._id,
        message,
        timestamp: now,
        messageId,
      });
    }
    
    setMessage("");
  };

  // Create a new group
  const createGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;

    const members = [...selectedMembers, currentUser._id];
    
    socket?.emit("create_group", {
      name: newGroupName,
      members,
      createdBy: currentUser._id
    }, (newGroup: Group) => {
      setGroups(prev => [...prev, newGroup]);
      setCreateGroupDialog(false);
      setNewGroupName("");
      setSelectedMembers([]);
      setActiveTab("groups");
      
      // Select the new group
      const newChat: Chat = {
        id: newGroup._id,
        type: "group",
        name: newGroup.name,
        picture: newGroup.picture
      };
      handleChatSelect(newChat);
    });
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

  // Selecting a chat
  const handleChatSelect = (chat: Chat) => {
    if (!socket || !chat.id || !currentUser._id) return;

    setSelectedChat(chat);

    if (chat.type === "group") {
      socket.emit(
        "fetch_group_history",
        { groupId: chat.id, userId: currentUser._id },
        (history: { senderId: string; senderName: string; message: string; timestamp: string; read: boolean; messageId: string; }[]) => {
          const formatted = history.map((msg) => ({
            from: msg.senderId === currentUser._id ? "me" as const : "them" as const,
            text: msg.message,
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            senderName: msg.senderName,
            read: msg.read,
            messageId: msg.messageId,
            groupId: chat.id
          }));
          setMessages(formatted);
          socket.emit("mark_group_messages_read", {
            groupId: chat.id,
            userId: currentUser._id,
          });
          setUnreadMessages((prev) => {
            const updated = { ...prev };
            delete updated[chat.id];
            return updated;
          });
        }
      );
    } else {
      socket.emit(
        "fetch_history",
        { targetId: chat.id, senderId: currentUser._id },
        (history: { senderId: string; message: string; timestamp: string; read: boolean; messageId: string; }[]) => {
          const formatted = history.map((msg) => ({
            from: msg.senderId === currentUser._id ? "me" as const : "them" as const,
            text: msg.message,
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            read: msg.read,
            messageId: msg.messageId,
          }));
          setMessages(formatted);
          socket.emit("mark_messages_read", {
            senderId: chat.id,
            receiverId: currentUser._id,
          });
          setUnreadMessages((prev) => {
            const updated = { ...prev };
            delete updated[chat.id];
            return updated;
          });
        }
      );
    }
  };

  // Toggle member selection for group creation
  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="flex h-full border rounded-xl overflow-hidden">
      <div className="w-64 border-r flex flex-col">
        <Tabs 
          defaultValue="direct" 
          className="w-full" 
          onValueChange={(v) => setActiveTab(v as "direct" | "groups")}
        >
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct"><UserIcon className="h-4 w-4 mr-2" />Users</TabsTrigger>
              <TabsTrigger value="groups"><Users className="h-4 w-4 mr-2" />Groups</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">
                {activeTab === "direct" ? "Users" : "Groups"}
              </h2>
              {activeTab === "groups" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCreateGroupDialog(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              type="text"
              placeholder={`Search ${activeTab === "direct" ? "users" : "groups"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
            />
          </div>
          
          <ScrollArea className="flex-1 h-[calc(70vh-8rem)]">
            {activeTab === "direct" ? (
              <TabsContent value="direct" className="m-0">
                {chats
                  .filter(chat => chat.type === "user")
                  .filter(chat => 
                    chat.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-2 p-2 mx-2 cursor-pointer rounded hover:bg-gray-100 ${
                        selectedChat?.id === chat.id ? "bg-gray-200" : ""
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={chat.picture} alt={chat.name} />
                          <AvatarFallback>{chat.name[0]}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                            chat.online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="text-sm flex-grow mr-2">
                        <div className="font-medium">{chat.name}</div>
                      </div>
                      {unreadMessages[chat.id] > 0 && (
                        <div className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadMessages[chat.id]}
                        </div>
                      )}
                    </div>
                  ))}
              </TabsContent>
            ) : (
              <TabsContent value="groups" className="m-0">
                {chats
                  .filter(chat => chat.type === "group")
                  .filter(chat => 
                    chat.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-2 p-2 mx-2 cursor-pointer rounded hover:bg-gray-100 ${
                        selectedChat?.id === chat.id ? "bg-gray-200" : ""
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chat.picture} alt={chat.name} />
                        <AvatarFallback>
                          <Users className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm flex-grow mr-2">
                        <div className="font-medium">{chat.name}</div>
                      </div>
                      {unreadMessages[chat.id] > 0 && (
                        <div className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {unreadMessages[chat.id]}
                        </div>
                      )}
                    </div>
                  ))}
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="border-b p-4">
              <CardTitle className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={selectedChat.picture} alt={selectedChat.name} />
                  <AvatarFallback>
                    {selectedChat.type === "group" ? <Users className="h-3 w-3" /> : selectedChat.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {selectedChat.name}
                  {selectedChat.type === "group" && (
                    <Badge variant="outline" className="ml-2">Group</Badge>
                  )}
                </span>
                {selectedChat.type === "user" && (
                  <span
                    className={`ml-2 h-2 w-2 rounded-full ${
                      selectedChat.online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages
                .filter((msg) => {
                  if (selectedChat.type === "group") {
                    return msg.groupId === selectedChat.id;
                  } else {
                    return (msg.from === "me" && msg.senderId === currentUser._id && !msg.groupId) ||
                           (msg.from === "them" && msg.senderId === selectedChat.id && !msg.groupId);
                  }
                })
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded-lg max-w-[70%] text-sm ${
                      msg.from === "me" ? "ml-auto bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {selectedChat.type === "group" && msg.from === "them" && (
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {msg.senderName || "Unknown"}
                      </div>
                    )}
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
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createGroupDialog} onOpenChange={setCreateGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input 
                id="group-name" 
                value={newGroupName} 
                onChange={(e) => setNewGroupName(e.target.value)} 
                placeholder="Enter group name" 
              />
            </div>
            <div className="space-y-2">
              <Label>Select Members</Label>
              <ScrollArea className="h-60 border rounded p-2">
                {users
                  .filter(u => u._id !== currentUser._id)
                  .map(user => (
                    <div 
                      key={user._id} 
                      className="flex items-center space-x-2 py-2 px-1 hover:bg-gray-50 rounded"
                    >
                      <Checkbox 
                        id={`user-${user._id}`} 
                        checked={selectedMembers.includes(user._id || "")}
                        onCheckedChange={() => toggleMemberSelection(user._id || "")}
                      />
                      <Label htmlFor={`user-${user._id}`} className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.picture} alt={user.fullName} />
                          <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user.fullName}</span>
                      </Label>
                    </div>
                  ))}
              </ScrollArea>
              <div className="text-sm text-gray-500">
                {selectedMembers.length} members selected
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateGroupDialog(false);
                setNewGroupName("");
                setSelectedMembers([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={createGroup} disabled={!newGroupName.trim() || selectedMembers.length === 0}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}