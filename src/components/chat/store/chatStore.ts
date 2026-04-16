import { atom } from 'jotai';
import { Chat, ChatMessage, Group, User } from '../types/ChatTypes';

export const usersAtom = atom<User[]>([]);
export const groupsAtom = atom<Group[]>([]);
export const chatsAtom = atom<Chat[]>([]);
export const selectedChatAtom = atom<Chat | null>(null);

export const messagesAtom = atom<ChatMessage[]>([]);
export const unreadMessagesAtom = atom<Record<string, number>>({});

// Enterprise state
export const typingUsersAtom = atom<Record<string, string[]>>({}); // chatId -> array of typing userNames
export const hasMoreMessagesAtom = atom<boolean>(true); // For pagination

// UI State
export const searchAtom = atom<string>("");
export const activeTabAtom = atom<"direct" | "groups">("direct");
export const createGroupDialogAtom = atom<boolean>(false);
