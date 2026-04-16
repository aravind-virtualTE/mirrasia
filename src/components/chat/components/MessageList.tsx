import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { messagesAtom, selectedChatAtom } from "../store/chatStore";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ currentUser }: { currentUser: { _id: string; fullName: string } }) {
  const [messages] = useAtom(messagesAtom);
  const [selectedChat] = useAtom(selectedChatAtom);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedChat) return null;

  const displayMessages = messages
    .filter((msg) => {
      if (selectedChat.type === "group") {
        return msg.groupId === selectedChat.id;
      } else {
        return (
          (msg.from === "me" && msg.senderId === currentUser._id && !msg.groupId && msg.targetId === selectedChat.id) ||
          (msg.from === "them" && msg.senderId === selectedChat.id && !msg.groupId)
        );
      }
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <>
      <div className="flex-1" />
      {displayMessages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} currentUser={currentUser} selectedChat={selectedChat} />
      ))}
      <div ref={messagesEndRef} className="h-1" />
    </>
  );
}
