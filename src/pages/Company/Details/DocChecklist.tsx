import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import Checklist from "./CheckList";
import { ChecklistCheck, ChecklistItem } from "./detailConstants";

interface ChecklistHistoryProps {
  items: ChecklistItem[];
  checkedItems: ChecklistCheck[];
  onCheckedChange: (itemId: string, isChecked: boolean) => void;
  currentUserRole: "user" | "admin" | "master";
}

const ChecklistHistory: React.FC<ChecklistHistoryProps> = ({
  items,
  checkedItems,
  onCheckedChange,
  currentUserRole,
}) => {
  const [activeTab, setActiveTab] = useState<string>("incorporation");

  return (
    <div className="container mx-auto px-4 py-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="incorporation">Incorporation</TabsTrigger>
            <TabsTrigger value="renew">Renew</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="incorporation">
          <Checklist
            items={items}
            checkedItems={checkedItems}
            onCheckedChange={onCheckedChange}
            currentUserRole={currentUserRole}
          />
        </TabsContent>
        {/* You can add Renew tab rendering logic here in future if needed */}
      </Tabs>
    </div>
  );
};

export default ChecklistHistory;
