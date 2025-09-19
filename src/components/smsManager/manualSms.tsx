/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUsers } from "@/services/dataFetch";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "@/hooks/use-toast";
import UserSearchComboBox, { User } from "./SearchCombo";
import { sendSms } from "./smsManagement";
import { getSMSLengthInfo } from "@/lib/utils";

interface ManualSMSComponentProps {
  onSmsSent?: () => void;
}

type RecipientMode = "contact" | "custom";

const PHONE_REGEX =
  /^\+?[1-9]\d{6,14}$/; // rough E.164-like (7–15 digits, optional +, no leading 0 country code)

const ManualSMSComponent: React.FC<ManualSMSComponentProps> = ({ onSmsSent }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [recipientMode, setRecipientMode] = useState<RecipientMode>("contact");
  const [customPhone, setCustomPhone] = useState("");
  const [smsInfo, setSmsInfo] = useState({ isGsm: true, maxChars: 160, segments: 1, remaining: 160 });

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

  useEffect(() => {
    setSmsInfo(getSMSLengthInfo(customMessage));
  }, [customMessage]);

  const effectivePhone = useMemo(() => {
    return recipientMode === "contact" ? selectedUser?.phone ?? "" : customPhone.trim();
  }, [recipientMode, selectedUser, customPhone]);

  const phoneIsValid = useMemo(() => {
    if (!effectivePhone) return false;
    return PHONE_REGEX.test(effectivePhone.replace(/\s+/g, ""));
  }, [effectivePhone]);

  const canSend = useMemo(() => {
    if (!customMessage.trim()) return false;
    if (recipientMode === "contact" && !selectedUser) return false;
    if (!phoneIsValid) return false;
    return true;
  }, [customMessage, recipientMode, selectedUser, phoneIsValid]);

  const handleSendManualSMS = async () => {
    if (!customMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    if (recipientMode === "contact" && !selectedUser) {
      toast({
        title: "No Recipient",
        description: "Please select a contact.",
        variant: "destructive",
      });
      return;
    }

    if (!phoneIsValid) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Enter a valid phone number in international format (e.g., +6591234567).",
        variant: "destructive",
      });
      return;
    }

    const phoneToUse = effectivePhone.replace(/\s+/g, "");

    try {
      // eslint-disable-next-line no-console
      //   console.log("Sending SMS to:", phoneToUse, "Message:", customMessage);
      const result = await sendSms(phoneToUse, customMessage);
      // eslint-disable-next-line no-console
      console.log("result===>", result);

      toast({
        title: "SMS Sent",
        description:
          recipientMode === "contact"
            ? `Message sent to ${selectedUser?.name}.`
            : `Message sent to ${phoneToUse}.`,
      });

      setCustomMessage("");
      setSelectedUser(null);
      setCustomPhone("");
      setRecipientMode("contact");
      onSmsSent?.();
    } catch (err: any) {
      toast({
        title: "Send Failed",
        description:
          typeof err?.message === "string" ? err.message : "Unable to send SMS.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setCustomMessage("");
    setSelectedUser(null);
    setCustomPhone("");
    setRecipientMode("contact");
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Send Custom SMS</h3>

        {/* Recipient Mode */}
        <div className="space-y-2">
          <Label>Recipient</Label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="recipient-mode"
                className="accent-black dark:accent-white"
                checked={recipientMode === "contact"}
                onChange={() => setRecipientMode("contact")}
              />
              <span className="text-sm">Saved contact</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="recipient-mode"
                className="accent-black dark:accent-white"
                checked={recipientMode === "custom"}
                onChange={() => setRecipientMode("custom")}
              />
              <span className="text-sm">Custom number</span>
            </label>
          </div>
        </div>

        {/* Contact Picker OR Custom Phone */}
        {recipientMode === "contact" ? (
          <div className="space-y-2">
            <UserSearchComboBox
              users={users}
              onSelect={(user: User) => setSelectedUser(user)}
              label="Select Contact"
            />
            {selectedUser?.phone ? (
              <p className="text-xs text-muted-foreground">
                Using: {selectedUser.phone}
              </p>
            ) : selectedUser ? (
              <p className="text-xs text-red-500">
                Selected contact has no phone number.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="custom-phone">Phone Number</Label>
            <Input
              id="custom-phone"
              placeholder="+6591234567"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              inputMode="tel"
            />
            <p
              className={`text-xs ${customPhone && !phoneIsValid
                ? "text-red-500"
                : "text-muted-foreground"
                }`}
            >
              {customPhone && !phoneIsValid
                ? "Invalid phone number. Use international format (E.164) starting with your country code."
                : "Enter an international number with country code (e.g., +6591234567)."}
            </p>
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="custom-message">Message Content</Label>
          <Textarea
            id="custom-message"
            value={customMessage}
            onChange={(e) => {
              const newValue = e.target.value;
              const { maxChars } = getSMSLengthInfo(newValue);
              if (newValue.length <= maxChars) {
                setCustomMessage(newValue);
              }
              // else: silently ignore (or you can beep/notify)
            }}
            placeholder="Type your custom SMS message here..."
            rows={4}
            maxLength={160}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {/* {customMessage.length}/160 characters */}
            {smsInfo.segments > 1 ? (
              <span className="text-red-500">
                ⚠️ {smsInfo.segments} SMS segments ({smsInfo.remaining} chars left in current segment)
              </span>
            ) : (
              <span>{smsInfo.remaining} characters remaining</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSendManualSMS}
          disabled={!canSend}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send SMS
        </Button>
        <Button variant="outline" onClick={clearAll}>
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ManualSMSComponent;
