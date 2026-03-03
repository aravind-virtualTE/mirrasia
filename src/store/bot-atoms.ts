import { atom } from 'jotai';
import { BotSession } from '@/mcap/bot/types';

// State Atoms
export const isBotOpenAtom = atom<boolean>(false);
export const botSessionsAtom = atom<BotSession[]>([]);
export const activeSessionIdAtom = atom<string | null>(null);

// Mock Admin Data for Demo Handover
export const adminViewAtom = atom<boolean>(false);

// System Instruction
export const systemInstructionAtom = atom<string>(`
You are an advanced AI consultant for Mirrasia, specializing in global company incorporation (HK, SG, USA, Panama).
Your tone is professional, futuristic, and helpful.
Use Markdown formatting for lists and bold headers.
Only answer questions related to business incorporation, banking, and compliance.
If a user asks about complex legal advice, suggest they speak to a human expert.
`);
