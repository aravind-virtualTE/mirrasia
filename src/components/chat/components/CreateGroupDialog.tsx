import { useState } from "react";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/hooks/Socket";
import {
  activeTabAtom,
  createGroupDialogAtom,
  groupsAtom,
  selectedChatAtom,
  usersAtom,
} from "../store/chatStore";
import { Chat, Group } from "../types/ChatTypes";

export function CreateGroupDialog({ currentUser }: { currentUser: { _id: string; fullName: string } }) {
  const socket = useSocket();
  const [open, setOpen] = useAtom(createGroupDialogAtom);
  const [users] = useAtom(usersAtom);
  const [, setGroups] = useAtom(groupsAtom);
  const [, setActiveTab] = useAtom(activeTabAtom);
  const [, setSelectedChat] = useAtom(selectedChatAtom);

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const createGroup = () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) return;

    const members = [...selectedMembers, currentUser._id];

    socket?.emit(
      "create_group",
      {
        name: newGroupName,
        members,
        createdBy: currentUser._id,
      },
      (newGroup: Group) => {
        setGroups((prev) => [...prev, newGroup]);
        setOpen(false);
        setNewGroupName("");
        setSelectedMembers([]);
        setActiveTab("groups");

        // Select the new group
        const newChat: Chat = {
          id: newGroup._id,
          type: "group",
          name: newGroup.name,
          picture: newGroup.picture,
        };
        setSelectedChat(newChat);
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
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
            <ScrollArea className="h-60 border rounded-md p-2 bg-slate-50">
              {users
                .filter((u) => u._id !== currentUser._id)
                .map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-2 py-2 px-1 hover:bg-white rounded transition-colors"
                  >
                    <Checkbox
                      id={`user-${user._id}`}
                      checked={selectedMembers.includes(user._id || "")}
                      onCheckedChange={() => toggleMemberSelection(user._id || "")}
                    />
                    <Label
                      htmlFor={`user-${user._id}`}
                      className="flex flex-1 items-center space-x-2 cursor-pointer font-normal"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.picture} alt={user.fullName} />
                        <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user.fullName}</span>
                    </Label>
                  </div>
                ))}
            </ScrollArea>
            <div className="text-sm text-gray-500 font-medium">
              {selectedMembers.length} members selected
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              setNewGroupName("");
              setSelectedMembers([]);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={createGroup}
            disabled={!newGroupName.trim() || selectedMembers.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
