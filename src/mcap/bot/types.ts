export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'admin';
    text: string; // HTML string for RichTextViewer
    timestamp: number;
}

export interface BotSession {
    id: string;
    userId: string; // Link to the logged-in user
    messages: ChatMessage[];
    assignedToAdmin?: boolean;
    lastActive: number;
}
