import { useEffect, useState } from "react";
import { MessageSquareShare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    createOrUpdateMemo,
    getMemos,
    shareMemo
} from "@/lib/api/FetchData";
import { fetchUsers } from "@/services/dataFetch";

type Message = {
    text: string;
    author: string;
    timestamp: string;
};

export default function MemoApp({ id }: { id: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sharedWith, setSharedWith] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState({id:"", name: ""});
    const [newText, setNewText] = useState("");
    const [users, setUsers] = useState([
        { id: '1', name: "Test User1" },
        { id: '2', name: "Test User2" },
    ])
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [selectedValue, setSelectedValue] = useState("");
    const handleSelectChange = (value:string) => {
        // console.log("value",value)
        setSelectedValue(value);
        const selectedUser = users.find(user => user.name === value);
        if (selectedUser) {
            setSelectedPerson(selectedUser);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            await fetchUsers().then((response) => {
                const admins = response.filter((e: { role: string; }) => e.role === "admin" || e.role === "master").map((e: { _id: string; fullName: string; }) => ({ id: e._id, name: e.fullName }))
                setUsers(admins)
            })
        }
        fetchUser()
        fetchMemos();
    }, []);

    const fetchMemos = async () => {
        try {
            const data = await getMemos(id, user.id);
            console.log("Data", data)
            setMessages(data.messages || []);
            setSharedWith(data.sharedWith || []);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleCreateMemo = async () => {
        if (!newText.trim()) return;
        const timestamp = new Date().toLocaleString("en-GB");
        
        try {
            await createOrUpdateMemo({
                text: newText,
                author: "Admin",
                timestamp,
                companyId: id,
                userId: user.id
            });
            setNewText("");
            fetchMemos();
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = async () => {
        try {
            await shareMemo(id, selectedPerson.id);
            setSelectedPerson({id: "", name: ""  });
            setOpen(false);
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

                {/* Shared With Info */}
                {sharedWith.length > 0 && (
                    <div className="mt-2 text-sm text-blue-600">
                        <strong>Shared with:</strong> {sharedWith.join(", ")}
                    </div>
                )}

                {/* Share Button */}
                <div className="mt-4">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <MessageSquareShare size={14} />
                                Share Memo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share Memo with a Person</DialogTitle>
                            </DialogHeader>                           
                            <Select onValueChange={handleSelectChange} value={selectedValue}>
                                <SelectTrigger className="w-[200px]"> {/* Adjust width as needed */}
                                    <SelectValue placeholder="Select User" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.length === 0 ? (
                                        <SelectItem disabled value="">
                                            No person found.
                                        </SelectItem>
                                    ) : (
                                        users.map((person) => (
                                            <SelectItem key={person.id} value={person.name}>
                                                {person.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <div className="flex justify-end mt-4">
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={handleShare}
                                    disabled={!selectedPerson}
                                >
                                    Share
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
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
