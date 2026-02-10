import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Message = {
    id: string;
    role: "bot" | "user";
    text: string;
    options?: { label: string; value: string }[];
    action?: "start_incorporation";
};

export default function McapBot() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "bot",
            text: "Hello! I'm the MirrAsia Concierge. I can help you find the perfect jurisdiction for your company or answer compliance questions.",
            options: [
                { label: "Find a Jurisdiction", value: "find_jurisdiction" },
                { label: "Compliance FAQ", value: "faq" },
                { label: "Start Demo Republic Inc.", value: "start_demo" }
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        processBotResponse(input);
    };

    const handleOptionClick = (value: string, label: string) => {
        const userMsg: Message = { id: Date.now().toString(), role: "user", text: label };
        setMessages(prev => [...prev, userMsg]);
        processBotResponse(value);
    };

    const processBotResponse = (trigger: string) => {
        // Simple Rule-Based Logic (Mocking LLM)
        setTimeout(() => {
            let botMsg: Message = { id: Date.now().toString(), role: "bot", text: "I'm not sure specifically, but our experts can help." };

            if (trigger.includes("find_jurisdiction") || trigger.toLowerCase().includes("find")) {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "Great. What is your primary business goal?",
                    options: [
                        { label: "Low Tax / Tax Neutrality", value: "goal_tax" },
                        { label: "Access to Asian Markets", value: "goal_asia" },
                        { label: "Privacy & Asset Protection", value: "goal_privacy" }
                    ]
                };
            } else if (trigger === "goal_tax") {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "For tax efficiency, I recommend looking at Panama or Hong Kong (territorial tax system). Do you need a bank account in the same country?",
                    options: [
                        { label: "Yes, local banking", value: "bank_local" },
                        { label: "No, global banking is fine", value: "bank_global" }
                    ]
                };
            } else if (trigger === "goal_asia" || trigger === "bank_local") {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "Hong Kong or Singapore are ideal choices. They offer strong banking infrastructure and prestige. However, compliance requirements are higher.",
                    options: [
                        { label: "Tell me about compliance", value: "faq_compliance" },
                        { label: "Start Hong Kong (Demo)", value: "start_hk" }
                    ]
                };
            } else if (trigger === "start_demo" || trigger === "start_hk") {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "Excellent choice. I'll take you to the secure incorporation form now.",
                    action: "start_incorporation"
                };
                // Auto-redirect after delay
                setTimeout(() => navigate("/incorporation-demo"), 2000);
            } else if (trigger.includes("faq")) {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "Most jurisdictions require Know-Your-Customer (KYC) documents: Passport + Proof of Address. We handle this securely via our centralized vault.",
                    options: [
                        { label: "Back to Menu", value: "menu" }
                    ]
                };
            } else if (trigger === "menu") {
                botMsg = {
                    id: Date.now().toString(),
                    role: "bot",
                    text: "How else can I assist?",
                    options: [
                        { label: "Find a Jurisdiction", value: "find_jurisdiction" },
                        { label: "Compliance FAQ", value: "faq" }
                    ]
                };
            }

            setMessages(prev => [...prev, botMsg]);
        }, 600);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 h-[80vh] flex flex-col">
            <Card className="flex-1 flex flex-col shadow-xl border-t-4 border-t-purple-600">
                <CardHeader className="border-b bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle>Mirra AI Concierge</CardTitle>
                            <p className="text-xs text-muted-foreground">Incorporation & Compliance Expert</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-purple-600" />}
                                        </div>
                                        <div className="space-y-2">
                                            <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                                {msg.text}
                                            </div>
                                            {msg.options && (
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.options.map((opt) => (
                                                        <Button
                                                            key={opt.value}
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-white hover:bg-purple-50 hover:text-purple-700 text-xs h-8"
                                                            onClick={() => handleOptionClick(opt.value, opt.label)}
                                                        >
                                                            {opt.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.action === "start_incorporation" && (
                                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/incorporation-demo")}>
                                                    Proceed to Form <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 border-t bg-white">
                    <div className="flex w-full gap-2">
                        <Input
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
