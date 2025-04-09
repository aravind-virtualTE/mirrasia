import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    createOrUpdateMemo,
    getMemos,
} from "@/lib/api/FetchData";

type Message = {
    text: string;
    author: string;
    timestamp: string;
};

export default function MemoApp({ id }: { id: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newText, setNewText] = useState("");
    useEffect(() => {       
        fetchMemos();
    }, []);

    const fetchMemos = async () => {
        try {
            const data = await getMemos(id);
            console.log("Data", data)
            setMessages(data.messages || []);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };
    const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

    const handleCreateMemo = async () => {
        if (!newText.trim()) return;
        const timestamp = new Date().toLocaleString("en-GB");
        
        try {
            await createOrUpdateMemo({
                text: newText,
                author: user?.fullName || "",
                timestamp,
                companyId: id,
            });
            setNewText("");
            fetchMemos();
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Memo</h1>
            {/* Memo messages display */}
            <div className="mb-4 border rounded p-4 bg-gray-100">
                {messages.length === 0 ? (
                    <div className="text-gray-500">No messages yet.</div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className="mb-2">
                            <div>{msg.text}</div>
                            <div className="text-sm text-gray-600">
                                {msg.author}, {msg.timestamp}
                            </div>
                            <hr className="my-2" />
                        </div>
                    ))
                )}
            </div>

            {/* New Message Input */}
            <div className="mt-6 flex">
                <Input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Type a message"
                />
                <Button
                    className="ml-2 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleCreateMemo}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
