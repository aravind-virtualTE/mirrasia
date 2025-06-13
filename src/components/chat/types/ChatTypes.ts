export interface User {
  _id?: string;
  fullName: string;
  email: string;
  role: string;
  picture: string;
  online: boolean;
}

export interface Group {
  _id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  picture?: string;
}

export interface ChatMessage {
  from: "me" | "them";
  text: string;
  timestamp: string;
  senderId?: string;
  senderName?: string;
  read: boolean;
  messageId?: string;
  groupId?: string;
}

export interface Chat {
  id: string;
  type: "user" | "group";
  name: string;
  picture?: string;
  online?: boolean;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
}
