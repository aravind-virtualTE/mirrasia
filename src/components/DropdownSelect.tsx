import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'; // Shadcn Select components
import { Input } from '@/components/ui/input'; // Shadcn Input component
import { Button } from '@/components/ui/button'; // Shadcn Button component

interface DropdownSelectProps {
  options: (string | number)[]; // List of options (e.g., prices, items)
  placeholder?: string; // Placeholder for the custom input
  selectedValue?: string | number; // Pre-selected value (optional)
  onSelect: (selectedValue: string | number) => void; // Callback when a value is selected
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  placeholder = 'Enter custom value',
  selectedValue: initialSelectedValue = '',
  onSelect,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | number>(initialSelectedValue);
  const [customValue, setCustomValue] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Sync internal state with the prop
  useEffect(() => {
    setSelectedValue(initialSelectedValue);
  }, [initialSelectedValue]);

  const handleSelectChange = (value: string) => {
    if (value === 'custom') {
      setIsCustom(true);
      setSelectedValue('');
    } else {
      setIsCustom(false);
      setSelectedValue(value);
      onSelect(value); // Notify parent of the selected value
    }
  };

  const handleCustomValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(event.target.value);
  };

  const handleCustomValueSelect = () => {
    if (customValue) {
      setSelectedValue(customValue);
      onSelect(customValue); // Notify parent of the custom value
      setIsCustom(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Select onValueChange={handleSelectChange} value={selectedValue.toString()}>
        <SelectTrigger className="w-[320px]">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem key={index} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom</SelectItem>
          {/* Show the custom value as an option if it exists */}
          {selectedValue && !options.includes(selectedValue) && (
            <SelectItem value={selectedValue.toString()}>
              {selectedValue}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={customValue}
            onChange={handleCustomValueChange}
          />
          <Button onClick={handleCustomValueSelect}>Select</Button>
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
// import React, { useState } from 'react';
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/select'; // Shadcn Select components
// import { Input } from '@/components/ui/input'; // Shadcn Input component
// import { Button } from '@/components/ui/button'; // Shadcn Button component

// interface DropdownSelectProps {
//   options: (string | number)[]; 
//   placeholder?: string;
//   onSelect: (selectedValue: string | number) => void; 
// }

// const DropdownSelect: React.FC<DropdownSelectProps> = ({
//   options,
//   placeholder = 'Enter custom value',
//   onSelect,
// }) => {
//   const [selectedValue, setSelectedValue] = useState<string | number>('');
//   const [customValue, setCustomValue] = useState<string>('');
//   const [isCustom, setIsCustom] = useState<boolean>(false);

//   const handleSelectChange = (value: string) => {
//     if (value === 'custom') {
//       setIsCustom(true);
//       setSelectedValue('');
//     } else {
//       setIsCustom(false);
//       setSelectedValue(value);
//       onSelect(value); // Notify parent of the selected value
//     }
//   };

//   const handleCustomValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setCustomValue(event.target.value);
//   };

//   const handleCustomValueSelect = () => {
//     if (customValue) {
//       setSelectedValue(customValue);
//       onSelect(customValue); // Notify parent of the custom value
//       setIsCustom(false);
//     }
//   };

//   return (
//     <div className="flex flex-col space-y-4">
//       <Select onValueChange={handleSelectChange} value={selectedValue.toString()}>
//         <SelectTrigger className="w-[180px]">
//           <SelectValue placeholder="Select an option" />
//         </SelectTrigger>
//         <SelectContent>
//           {options.map((option, index) => (
//             <SelectItem key={index} value={option.toString()}>
//               {option}
//             </SelectItem>
//           ))}
//           <SelectItem value="custom">Custom</SelectItem>     
//           {selectedValue && !options.includes(selectedValue) && (
//             <SelectItem value={selectedValue.toString()}>
//               {selectedValue}
//             </SelectItem>
//           )}
//         </SelectContent>
//       </Select>

//       {isCustom && (
//         <div className="flex space-x-2">
//           <Input
//             type="text"
//             placeholder={placeholder}
//             value={customValue}
//             onChange={handleCustomValueChange}
//           />
//           <Button onClick={handleCustomValueSelect}>Select</Button>
//         </div>
//       )}

//       {/* {selectedValue && (
//         <div className="mt-4">
//           <p className="text-gray-700">Selected Value: {selectedValue}</p>
//         </div>
//       )} */}
//     </div>
//   );
// };

// export default DropdownSelect;