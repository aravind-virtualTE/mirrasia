import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChecklistCheck,ChecklistItem } from "./detailConstants";

interface ChecklistProps {
  items: ChecklistItem[];
  checkedItems: ChecklistCheck[];
  onCheckedChange: (itemId: string, isChecked: boolean) => void;
  currentUserRole: "user" | "admin" | "master";
}

const Checklist: React.FC<ChecklistProps> = ({ items, checkedItems = [], onCheckedChange, currentUserRole }) => {
  const isEditable = currentUserRole === "admin" || currentUserRole === "master";

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const checkedEntry = checkedItems.find(i => i.id === item.id);
        const isChecked = !!checkedEntry;
        return (
          <li key={item.id} className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-700 py-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id={item.id}
                checked={isChecked}
                onCheckedChange={(checked) => isEditable && onCheckedChange(item.id, Boolean(checked))}
                disabled={!isEditable}
              />
              <Label
                htmlFor={item.id}
                className={isChecked ? "line-through text-gray-500" : "cursor-pointer"}
              >
                {item.label}
              </Label>
            </div>
            {isChecked && (
              <span className="text-xs text-muted-foreground pl-6">
                ✔ Checked by {checkedEntry?.checkedBy} on {new Date(checkedEntry!.checkedAt).toLocaleString()}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};


export default Checklist;