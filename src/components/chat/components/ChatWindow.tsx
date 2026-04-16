import { useAtom } from "jotai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { selectedChatAtom, typingUsersAtom } from "../store/chatStore";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatWindow({ currentUser }: { currentUser: { _id: string; fullName: string } }) {
  const [selectedChat] = useAtom(selectedChatAtom);
  const [typingUsers] = useAtom(typingUsersAtom);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-lg bg-gray-50/50">
        Select a chat to start messaging
      </div>
    );
  }

  const actTypingUsers = typingUsers[selectedChat.id] || [];
  const typingString =
    actTypingUsers.length > 0
      ? `${actTypingUsers.join(", ")} ${actTypingUsers.length === 1 ? "is" : "are"} typing...`
      : "";

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <CardHeader className="border-b p-4 min-h-[73px]">
        <CardTitle className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage src={selectedChat.picture} alt={selectedChat.name} />
            <AvatarFallback>
              {selectedChat.type === "group" ? <Users className="h-4 w-4" /> : selectedChat.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-base flex items-center gap-2">
              {selectedChat.name}
              {selectedChat.type === "group" && (
                <Badge variant="outline" className="text-[10px] h-5">
                  Group
                </Badge>
              )}
              {selectedChat.type === "user" && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    selectedChat.online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              )}
            </span>
            {typingString && (
              <span className="text-xs text-blue-500 italic animate-pulse">{typingString}</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col bg-slate-50/50">
        <MessageList currentUser={currentUser} />
      </CardContent>

      <div className="p-4 border-t bg-white">
        <ChatInput currentUser={currentUser} />
      </div>
    </div>
  );
}
