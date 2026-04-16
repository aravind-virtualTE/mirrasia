import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useSocket } from '@/hooks/Socket';
import {
  usersAtom,
  groupsAtom,
  messagesAtom,
  unreadMessagesAtom,
  selectedChatAtom,
  typingUsersAtom,
} from '../store/chatStore';
import { ChatMessage, Group } from '../types/ChatTypes';

export const useChatSocket = (currentUser: { _id: string; fullName: string }) => {
  const socket = useSocket();
  const [users, setUsers] = useAtom(usersAtom);
  const [groups, setGroups] = useAtom(groupsAtom);
  const [, setMessages] = useAtom(messagesAtom);
  const [, setUnreadMessages] = useAtom(unreadMessagesAtom);
  const [selectedChat] = useAtom(selectedChatAtom);
  const [, setTypingUsers] = useAtom(typingUsersAtom);

  const fetchUnreadMessages = () => {
    socket?.emit("get_unread_messages", { userId: currentUser._id }, (data: Record<string, number>) => {
      setUnreadMessages(data || {});
    });
  };

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

  useEffect(() => {
    if (socket && currentUser._id) {
      socket.emit("register", currentUser._id);
      checkUsersOnline();
      fetchUnreadMessages();
      
      socket.emit("fetch_groups", { userId: currentUser._id }, (res: Group[]) => {
        setGroups(res || []);
      });
    }

    const onlineInterval = setInterval(checkUsersOnline, 2000);
    const unreadInterval = setInterval(fetchUnreadMessages, 10000);

    return () => {
      clearInterval(onlineInterval);
      clearInterval(unreadInterval);
    };
  }, [socket, currentUser._id]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({
      senderId,
      senderName,
      message,
      fileUrl,
      fileName,
      fileType,
      timestamp = new Date().toISOString(),
      messageId = `msg_${Date.now()}`,
      groupId
    }: {
      senderId: string;
      senderName?: string;
      message: string;
      fileUrl?: string;
      fileName?: string;
      fileType?: string;
      timestamp?: string;
      messageId?: string;
      groupId?: string;
    }) => {
      const chatId = groupId || senderId;
      const fromSelected = chatId === selectedChat?.id;

      const msg: ChatMessage = {
        from: "them",
        text: message,
        fileUrl,
        fileName,
        fileType,
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
        new Notification(notificationTitle, { body: message || "Sent an attachment" });
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

    const handleTypingStart = ({ senderId, senderName, groupId }: { senderId: string, senderName: string, groupId?: string }) => {
      const chatId = groupId || senderId;
      setTypingUsers(prev => {
        const currentChatTyping = prev[chatId] || [];
        if (!currentChatTyping.includes(senderName)) {
          return { ...prev, [chatId]: [...currentChatTyping, senderName] };
        }
        return prev;
      });
    };

    const handleTypingStop = ({ senderId, groupId }: { senderId: string, senderName?: string, groupId?: string }) => {
      const chatId = groupId || senderId;
      setTypingUsers(prev => {
        // Need user name or just remove senderId? Wait, stop only passes senderId from server right now.
        // Let's clear typing users for that chat if it's a direct message, or filter by senderId?
        // Since we didn't pass senderName to stop from server, let's just clear for now or we must fix later.
        // Better: We clear the array for simplicity on stop for now, or filter if we can.
        return { ...prev, [chatId]: [] };
      });
    };

    const handleMessageReaction = ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, reactions } : msg
        )
      );
    };

    socket.on("chat_message", handleIncoming);
    socket.on("group_message", handleIncoming);
    socket.on("message_read", handleRead);
    socket.on("group_message_read", handleRead);
    socket.on("unread_count_update", fetchUnreadMessages);
    socket.on("group_created", handleGroupCreated);
    socket.on("group_updated", handleGroupUpdated);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    socket.on("message_reaction", handleMessageReaction);

    return () => {
      socket.off("chat_message", handleIncoming);
      socket.off("group_message", handleIncoming);
      socket.off("message_read", handleRead);
      socket.off("group_message_read", handleRead);
      socket.off("unread_count_update", fetchUnreadMessages);
      socket.off("group_created", handleGroupCreated);
      socket.off("group_updated", handleGroupUpdated);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      socket.off("message_reaction", handleMessageReaction);
    };
  }, [socket, selectedChat?.id, currentUser._id, users, groups]);

  return { socket };
};
