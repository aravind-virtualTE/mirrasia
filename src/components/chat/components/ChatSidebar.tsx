import { useAtom } from "jotai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, User as UserIcon, Users } from "lucide-react";
import {
  activeTabAtom,
  chatsAtom,
  createGroupDialogAtom,
  searchAtom,
  selectedChatAtom,
  unreadMessagesAtom,
  messagesAtom
} from "../store/chatStore";
import { Chat } from "../types/ChatTypes";
import { useSocket } from "@/hooks/Socket";

export function ChatSidebar({ currentUser }: { currentUser: { _id: string; fullName: string } }) {
  const socket = useSocket();
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);
  const [search, setSearch] = useAtom(searchAtom);
  const [chats] = useAtom(chatsAtom);
  const [selectedChat, setSelectedChat] = useAtom(selectedChatAtom);
  const [unreadMessages, setUnreadMessages] = useAtom(unreadMessagesAtom);
  const [, setCreateGroupDialog] = useAtom(createGroupDialogAtom);
  const [, setMessages] = useAtom(messagesAtom);

  const handleChatSelect = (chat: Chat) => {
    if (!socket || !chat.id || !currentUser._id) return;

    setSelectedChat(chat);

    // Initial fetch
    if (chat.type === "group") {
      socket.emit(
        "fetch_group_history",
        { groupId: chat.id, userId: currentUser._id, limit: 50, offset: 0 },
        (history: any[]) => {
          const formatted = history.map((msg) => ({
            from: msg.senderId === currentUser._id ? ("me" as const) : ("them" as const),
            text: msg.message,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileType: msg.fileType,
            reactions: msg.reactions,
            timestamp: msg.timestamp,
            senderId: msg.senderId,
            senderName: msg.senderName,
            read: msg.read,
            messageId: msg.messageId,
            groupId: chat.id,
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
        { targetId: chat.id, senderId: currentUser._id, limit: 50, offset: 0 },
        (history: any[]) => {
          const formatted = history.map((msg) => ({
            from: msg.senderId === currentUser._id ? ("me" as const) : ("them" as const),
            text: msg.message,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileType: msg.fileType,
            reactions: msg.reactions,
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

  return (
    <div className="w-64 border-r flex flex-col bg-white">
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(v) => setActiveTab(v as "direct" | "groups")}
      >
        <div className="p-4 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">
              <UserIcon className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">{activeTab === "direct" ? "Users" : "Groups"}</h2>
            {activeTab === "groups" && (
              <Button variant="ghost" size="sm" onClick={() => setCreateGroupDialog(true)}>
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
          <TabsContent value={activeTab} className="m-0">
            {chats
              .filter((chat) => chat.type === (activeTab === "direct" ? "user" : "group"))
              .filter((chat) => chat.name.toLowerCase().includes(search.toLowerCase()))
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
                      <AvatarFallback>
                        {chat.type === "group" ? <Users className="h-4 w-4" /> : chat.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {chat.type === "user" && (
                      <span
                        className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                          chat.online ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    )}
                  </div>
                  <div className="text-sm flex-grow mr-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    <div className="font-medium">{chat.name}</div>
                  </div>
                  {unreadMessages[chat.id] && unreadMessages[chat.id] > 0 && (
                    <div className="min-w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                      {unreadMessages[chat.id]}
                    </div>
                  )}
                </div>
              ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
