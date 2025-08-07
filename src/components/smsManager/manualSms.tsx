/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUsers } from "@/services/dataFetch";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { toast } from "@/hooks/use-toast";
import UserSearchComboBox, { User } from "./SearchCombo";
import {sendSms} from "./smsManagement"

interface ManualSMSComponentProps {
    onSmsSent?: () => void;
}

const ManualSMSComponent: React.FC<ManualSMSComponentProps> = ({ onSmsSent }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [customMessage, setCustomMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    useEffect(() => {
        const load = async () => {
            const response = await fetchUsers();
            const data = response.map((u: any) => ({
                id: u._id,
                name: u.fullName,
                phone: u.phone,
                email: u.email,
            }));
            setUsers(data);
        };
        load();
    }, []);

    const handleSendManualSMS = async () => {
        if (!customMessage.trim() || selectedUser == null) {
            toast({
                title: "Missing Information",
                description: "Please enter a message and select a contact.",
                variant: "destructive",
            });
            return;
        }
        if (selectedUser?.phone == '') {
            toast({
                title: "Missing Phone Number",
                description: "User doesnt seem to have phone number.",
                variant: "destructive",
            });
            return;
        }
        console.log("Sending SMS to:", selectedUser.phone, "Message:", customMessage);
        const result = await sendSms(selectedUser.phone!, customMessage);
        console.log("result===>", result)
        toast({
            title: "SMS Sent Successfully",
            description: `Message sent to user.`,
        });

        setCustomMessage("");
        setSelectedUser(null);
        if (onSmsSent) {
            onSmsSent();
        }
    };

    return (
        <div className="grid gap-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Send Custom SMS</h3>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <UserSearchComboBox
                            users={users}
                            onSelect={(user: User) => { setSelectedUser(user) }}
                            label="Recipient"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="custom-message">Message Content</Label>
                        <Textarea
                            id="custom-message"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Type your custom SMS message here..."
                            rows={4}
                            maxLength={160}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {customMessage.length}/160 characters
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    onClick={handleSendManualSMS}
                    disabled={!customMessage.trim() || selectedUser == null}
                    className="flex items-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    Send SMS
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        setCustomMessage("");
                        setSelectedUser(null)
                    }}
                >
                    Clear All
                </Button>
            </div>
        </div>
    );
};

export default ManualSMSComponent;
