import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DropdownSelectProps {
  options: (string | number)[];
  placeholder?: string;
  selectedValue?: string | number;
  onSelect: (selectedValue: string | number) => void;
  disabled?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  placeholder = 'Enter custom value',
  selectedValue: initialSelectedValue = '',
  onSelect,
  disabled = false,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | number>(initialSelectedValue);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Sync internal state with the prop
  useEffect(() => {
    setSelectedValue(initialSelectedValue);
  }, [initialSelectedValue]);

  // Close custom UI if disabled becomes true
  useEffect(() => {
    if (disabled) setIsCustom(false);
  }, [disabled]);

  const handleSelectChange = (value: string) => {
    if (disabled) return;
    if (value === 'custom') {
      setIsCustom(true);
      setSelectedValue('');
    } else {
      setIsCustom(false);
      setSelectedValue(value);
      onSelect(value);
    }
  };

  const handleCustomValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setCustomValue(event.target.value);
  };

  const handleCustomValueSelect = () => {
    if (disabled) return;
    if (customValue) {
      setSelectedValue(customValue);
      onSelect(customValue);
      setIsCustom(false);
    }
  };

  const optionExists =
    selectedValue !== '' &&
    options.some((opt) => opt.toString() === selectedValue.toString());

  return (
    <div className="space-y-2">
      <Select value={String(selectedValue)} onValueChange={handleSelectChange} disabled={disabled}>
        <SelectTrigger className="h-9 rounded-md bg-background">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {options.map((option, index) => (
            <SelectItem key={index} value={String(option)}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom</SelectItem>
          {/* Show the custom/unknown selected value as an option if it exists */}
          {selectedValue !== '' && !optionExists && (
            <SelectItem value={String(selectedValue)}>{selectedValue}</SelectItem>
          )}
        </SelectContent>
      </Select>

      {isCustom && !disabled && (
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={customValue}
            onChange={handleCustomValueChange}
            className="h-9 rounded-md"
          />
          <Button onClick={handleCustomValueSelect} size="sm" className="h-9">
            Select
          </Button>
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
