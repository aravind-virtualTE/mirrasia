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
  const [customValue, setCustomValue] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

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
      onSelect(value); // Notify parent
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
      onSelect(customValue); // Notify parent
      setIsCustom(false);
    }
  };

  const optionExists =
    selectedValue !== '' &&
    options.some((opt) => opt.toString() === selectedValue.toString());

  return (
    <div className="flex flex-col space-y-4" aria-disabled={disabled}>
      <Select
        onValueChange={handleSelectChange}
        value={selectedValue.toString()}
        disabled={disabled}
      >
        <SelectTrigger
          className={`w-[320px] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom</SelectItem>
          {/* Show the custom/unknown selected value as an option if it exists */}
          {selectedValue !== '' && !optionExists && (
            <SelectItem value={selectedValue.toString()}>{selectedValue}</SelectItem>
          )}
        </SelectContent>
      </Select>

      {isCustom && !disabled && (
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={customValue}
            onChange={handleCustomValueChange}
            disabled={disabled}
            readOnly={disabled}
          />
          <Button onClick={handleCustomValueSelect} disabled={disabled}>
            Select
          </Button>
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
