import { useEffect } from "react";
import { useAtom } from "jotai";
import { fetchUsers } from "@/services/dataFetch";
import { usersAtom, chatsAtom, groupsAtom } from "./store/chatStore";
import { useChatSocket } from "./hooks/useChatSocket";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatWindow } from "./components/ChatWindow";
import { CreateGroupDialog } from "./components/CreateGroupDialog";
import { Chat } from "./types/ChatTypes";

export default function ChatInterface() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { _id: user.id, fullName: user.fullName } : { _id: "", fullName: "" };

  // Init global state hook
  const [, setUsers] = useAtom(usersAtom);
  const [users] = useAtom(usersAtom);
  const [groups] = useAtom(groupsAtom);
  const [, setChats] = useAtom(chatsAtom);

  // Initialize socket connections
  useChatSocket(currentUser);

  useEffect(() => {
    const initUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        // Filter users based on enterprise access definitions
        const admins = fetchedUsers.filter(
          (e: { role: string }) => e.role === "admin" || e.role === "master"
        );
        setUsers(admins);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    initUsers();
  }, [setUsers]);

  // Sync chats metadata lists when users or groups change
  useEffect(() => {
    const directChats: Chat[] = users
      .filter((u) => u._id !== currentUser._id)
      .map((u) => ({
        id: u._id || "",
        type: "user",
        name: u.fullName,
        picture: u.picture,
        online: u.online,
      }));

    const groupChats: Chat[] = groups.map((g) => ({
      id: g._id,
      type: "group",
      name: g.name,
      picture: g.picture,
    }));

    setChats([...directChats, ...groupChats]);
  }, [users, groups, currentUser._id, setChats]);

  if (!currentUser._id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Please log in to use chat features.
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] min-h-[600px] border shadow-sm rounded-xl overflow-hidden bg-gray-50">
      <ChatSidebar currentUser={currentUser} />
      <ChatWindow currentUser={currentUser} />
      <CreateGroupDialog currentUser={currentUser} />
    </div>
  );
}