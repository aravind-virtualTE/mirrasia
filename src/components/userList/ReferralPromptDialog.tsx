import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ReferralPromptProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { type: "referral" | "sales"; value: string }) => void;
};

export const ReferralPromptDialog: React.FC<ReferralPromptProps> = ({ open, onClose, onSubmit }) => {
  const [selectedType, setSelectedType] = useState<"referral" | "sales" | "">("");
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (selectedType && value.trim()) {
      onSubmit({ type: selectedType, value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How did you hear about us?</DialogTitle>
        </DialogHeader>

        <RadioGroup
          value={selectedType}
          onValueChange={(val) => {
            setSelectedType(val as "referral" | "sales");
            setValue(""); // reset value when type changes
          }}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="referral" id="referral" />
            <Label htmlFor="referral">Referral</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sales" id="sales" />
            <Label htmlFor="sales">Sales Person</Label>
          </div>
        </RadioGroup>

        {selectedType && (
          <div className="space-y-1 pt-4">
            <Label htmlFor="info">{selectedType === "referral" ? "Referral Code or Name" : "Sales Person Name"}</Label>
            <Input
              id="info"
              placeholder={selectedType === "referral" ? "e.g. ABC123 or John Doe" : "e.g. Jane Smith"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={!selectedType || !value.trim()}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
