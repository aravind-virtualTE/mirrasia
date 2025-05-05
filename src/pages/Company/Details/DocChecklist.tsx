import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistProps {
  items: ChecklistItem[];
  checkedItems: string[];
  onCheckedChange: (itemId: string, isChecked: boolean) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, checkedItems= [], onCheckedChange }) => {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2 p-0 border-b border-gray-100 dark:border-gray-700">
          <Checkbox
            id={item.id}
            checked={checkedItems.includes(item.id)}
            onCheckedChange={(checked) => onCheckedChange(item.id, Boolean(checked))}
          />
          <Label
            htmlFor={item.id}
            className={checkedItems.includes(item.id) ? "line-through text-gray-500" : "cursor-pointer"}
          >
            {item.label}
          </Label>
        </li>
      ))}
    </ul>
  );
};

export default Checklist;