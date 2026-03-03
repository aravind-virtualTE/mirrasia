import React from 'react';
import { CLAIM_SETS } from './claimSets';
import { Checkbox } from "@/components/ui/checkbox";

interface ClaimsListProps {
  selectedClaims: Set<string>;
  onToggle: (key: string) => void;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({ selectedClaims, onToggle }) => (
  <div className="border border-border rounded-xl p-0 max-h-80 overflow-y-auto bg-muted/5">
    {CLAIM_SETS.map((set, i) => (
      <div key={set.cat} className="border-b border-border last:border-0">
        <div className="sticky top-0 bg-muted/90 backdrop-blur-sm px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0E3A8A] z-10 border-b border-border/50">
          {set.cat}
        </div>
        <div className="p-2 space-y-1">
          {set.items.map((item, j) => {
            const key = `${i}:${j}`;
            const isChecked = selectedClaims.has(key);
            return (
              <div
                key={key}
                className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                onClick={() => onToggle(key)}
              >
                <Checkbox
                  id={key}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(key)}
                  className="mt-1 shrink-0"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={key}
                    className="text-xs font-medium leading-normal cursor-pointer text-foreground/80 select-none"
                  >
                    {item.label}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);
