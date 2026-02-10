/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, Minimize2, Plus, MessageSquare, Menu, Sparkles, User as UserIcon } from "lucide-react";
import { isBotOpenAtom, botSessionsAtom, activeSessionIdAtom, systemInstructionAtom, adminViewAtom } from "@/store/bot-atoms";
import { TiptapViewer } from "@/components/TiptapViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MCAP_CONFIG_MAP, MCAP_CONFIGS } from "../configs/registry";

const SUGGESTED_QUESTIONS = [
    "How to incorporate in Hong Kong?",
    "What are the requirements for Panama?",
    "Compare Singapore vs HK taxes",
    "Show me all available countries"
];

// Build context about available countries from configs
const buildCountryContext = () => {
    const countries = MCAP_CONFIGS.map(cfg => ({
        id: cfg.id,
        code: cfg.countryCode,
        name: cfg.countryName,
        currency: cfg.currency,
        stepCount: cfg.steps.length
    }));

    return `\n\nAVAILABLE INCORPORATION JURISDICTIONS:\n${countries.map(c =>
        `- **${c.name}** (${c.code}): ${c.stepCount} steps, Currency: ${c.currency}`
    ).join('\n')}\n\nWhen users ask about incorporating in any of these countries, inform them that we have a complete online incorporation form available. Guide them to navigate to the MCAP dashboard where they can select their desired jurisdiction and complete the incorporation process step-by-step.`;
};

export function McapBotWidget() {
    const [isOpen, setIsOpen] = useAtom(isBotOpenAtom);
    const [sessions, setSessions] = useAtom(botSessionsAtom);
    const [activeSessionId, setActiveSessionId] = useAtom(activeSessionIdAtom);
    const [systemInstruction] = useAtom(systemInstructionAtom);
    const [isAdminView, setIsAdminView] = useAtom(adminViewAtom);

    // Local UI State
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [suggestedConfigId, setSuggestedConfigId] = useState<string | null>(null);
    const navigate = useNavigate();

    // Get User Context
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
    const userRole = user.role || "user";
    const userId = user.id || "guest";
    const userName = user.fullName || "Guest User";

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [sessions, activeSessionId, isOpen, isThinking]);

    // Initialize Session
    useEffect(() => {
        if (isOpen && sessions.length === 0) {
            startNewChat();
        }
    }, [isOpen]);

    const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

    const startNewChat = () => {
        const newId = crypto.randomUUID();
        const newSession = {
            id: newId,
            userId: userId,
            messages: [],
            lastActive: Date.now()
        };
        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newId);
        setShowSidebar(false);
    };

    // Enhanced country detection with comprehensive keyword matching
    const detectConfigFromText = (text: string) => {
        const lower = text.toLowerCase();

        // Country-specific keywords mapping
        const countryKeywords: Record<string, string[]> = {
            "hk-full": ["hong kong", "hk", "hongkong"],
            "sg-full": ["singapore", "sg"],
            "us-full": ["usa", "united states", "us", "america", "delaware", "wyoming"],
            "pa-full": ["panama", "pa"],
            "ppif-full": ["panama foundation", "ppif", "private interest foundation"],
            "cr-full": ["costa rica", "cr"],
            "uae-ifza": ["uae", "dubai", "ifza", "united arab emirates"],
        };

        // Check each config for keyword matches
        for (const [configId, keywords] of Object.entries(countryKeywords)) {
            if (keywords.some(keyword => {
                // For short keywords (like 'pa', 'hk', 'sg', 'uae'), use word boundaries to avoid partial matches
                if (keyword.length <= 3) {
                    const regex = new RegExp(`\\b${keyword}\\b`, "i");
                    return regex.test(text);
                }
                return lower.includes(keyword);
            })) {
                return configId;
            }
        }

        return null;
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const detected = detectConfigFromText(text);
        if (detected && MCAP_CONFIG_MAP[detected]) {
            setSuggestedConfigId(detected);
        }

        const userMsg = {
            id: crypto.randomUUID(),
            role: 'user' as const,
            text: text,
            timestamp: Date.now()
        };

        const currentId = activeSessionId || sessions[0]?.id;
        if (!currentId) return;

        setSessions(prev => prev.map(s => s.id === currentId ? {
            ...s, messages: [...s.messages, userMsg], lastActive: Date.now()
        } : s));

        setInput("");
        setIsThinking(true);

        try {
            if (activeSession?.assignedToAdmin) {
                setTimeout(() => {
                    setIsThinking(false);
                }, 1000);
                return;
            }

            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

            if (!apiKey) {
                setTimeout(() => {
                    const mockReply = { id: crypto.randomUUID(), role: 'model' as const, text: "I am ready to help, but I need a valid API Key configuration to connect to my brain (Gemini).", timestamp: Date.now() };
                    setSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: [...s.messages, userMsg, mockReply] } : s));
                    setIsThinking(false);
                }, 1000);
                return;
            }

            const genAI = new GoogleGenAI({ apiKey });

            const history = activeSession?.messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })) || [];

            // Build enhanced system instruction with country context
            const enhancedInstruction = systemInstruction + buildCountryContext() + `\n\nIMPORTANT: When users ask about incorporation in any country, always mention that they can start the incorporation process immediately by clicking the "Start Form" button that will appear, or by navigating to the MCAP dashboard at /incorporation.`;

            const result = await genAI.models.generateContent({
                // model: "gemini-3-flash-preview",Gemini 2.5 Flash Native Audio Dialog
                model: "gemini-2.5-flash-lite",
                config: {
                    systemInstruction: enhancedInstruction
                },
                contents: [...history, { role: 'user', parts: [{ text }] }]
            });

            const responseText = result.text || "";
            const htmlText = responseText;

            const botMsg = {
                id: crypto.randomUUID(),
                role: 'model' as const,
                text: htmlText,
                timestamp: Date.now()
            };

            setSessions(prev => prev.map(s => s.id === currentId ? {
                ...s, messages: [...s.messages, botMsg]
            } : s));

        } catch (error: any) {
            console.error("Gemini Error:", error);
            const errorMsg = {
                id: crypto.randomUUID(),
                role: 'model' as const,
                text: "I encountered a neural glitch. Please try again.",
                timestamp: Date.now()
            };
            setSessions(prev => prev.map(s => s.id === currentId ? {
                ...s, messages: [...s.messages, errorMsg]
            } : s));
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-transform hover:scale-105 z-50 animate-bounce"
            >
                <Bot className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[450px] max-w-[90vw] h-[650px] bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 border-t-4 border-t-purple-600">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => setShowSidebar(!showSidebar)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                Mirrasia AI
                                {userRole === 'admin' && <span className="bg-red-500 text-[10px] px-1 rounded text-white font-normal">ADMIN MODE</span>}
                            </h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    {userRole === 'admin' && (
                        <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" title="Switch View" onClick={() => setIsAdminView(!isAdminView)}>
                            <UserIcon className="w-4 h-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" onClick={() => setIsOpen(false)}>
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar */}
                <div className={cn(
                    "absolute inset-y-0 left-0 w-64 bg-slate-100 dark:bg-slate-900 transform transition-transform z-20 border-r dark:border-slate-800 shadow-xl",
                    showSidebar ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="p-4 flex flex-col h-full">
                        <Button onClick={startNewChat} className="mb-4 gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="w-4 h-4" /> New Chat
                        </Button>
                        <div className="flex-1 overflow-y-auto space-y-1">
                            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-tight">History</h4>
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setActiveSessionId(s.id); setShowSidebar(false); }}
                                    className={cn(
                                        "w-full text-left p-2 rounded text-sm truncate hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300",
                                        activeSessionId === s.id && "bg-slate-200 dark:bg-slate-800 font-medium border border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400"
                                    )}
                                >
                                    <MessageSquare className="w-3 h-3" />
                                    {s.messages[0]?.text.substring(0, 30) || "New Conversation"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/50 relative w-full">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                        {activeSession?.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                                <Sparkles className="w-10 h-10 text-purple-600 mb-2 opacity-50" />
                                <p className="font-medium text-slate-800 dark:text-slate-200">Hello, {userName}!</p>
                                <p className="text-xs max-w-[200px] mt-1 dark:text-slate-400">I am your Mirrasia AI bot. I can help with company incorporation across major global hubs.</p>
                            </div>
                        )}

                        {activeSession?.messages.map((msg) => (
                            <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start gap-2")}>
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-tl-none text-slate-800 dark:text-slate-200"
                                )}>
                                    {msg.role === 'user' ? (
                                        msg.text
                                    ) : (
                                        <TiptapViewer content={msg.text} className="text-slate-800 dark:text-slate-200" />
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 ml-2">
                                        <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex justify-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                    </div>

                    {suggestedConfigId && (
                        <div className="px-4 pb-3">
                            <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                            🎯 {MCAP_CONFIG_MAP[suggestedConfigId]?.countryName} Incorporation Detected
                                        </div>
                                        <div className="text-xs text-purple-700 dark:text-purple-300">
                                            Ready to start? Our unified form will guide you through {MCAP_CONFIG_MAP[suggestedConfigId]?.steps.length} simple steps.
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => navigate(`/incorporation?country=${suggestedConfigId}`)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                                    >
                                        Start {MCAP_CONFIG_MAP[suggestedConfigId]?.countryName} Form
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => navigate('/incorporation')}
                                        className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                                    >
                                        View All Countries
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suggestions */}
                    {activeSession?.messages.length === 0 && (
                        <div className="px-4 pb-4 flex gap-2 flex-wrap">
                            {SUGGESTED_QUESTIONS.map(q => (
                                <button
                                    key={q}
                                    onClick={() => handleSend(q)}
                                    className="text-xs bg-white dark:bg-slate-800 border dark:border-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-2 shrink-0">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={activeSession?.assignedToAdmin ? "Waiting for agent..." : "Ask a question..."}
                            className="bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-1 focus-visible:ring-purple-500 dark:text-slate-100"
                        />
                        <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isThinking} className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
