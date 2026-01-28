import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
  placeText: string
};

const SearchBox = ({ value, onChange, onSearch, isFocused, setIsFocused,placeText }: SearchBoxProps) => {
  return (
    <div className="w-[400px]">
      <div className="relative">
        <div
          className={`
            flex items-center w-full rounded-b-md rounded-t-md border transition-all duration-200 bg-white
            ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-sm hover:shadow-md'}
          `}
        >
          <div className="pl-4 pr-3 cursor-pointer">
            <Search className="h-4 w-4 text-gray-400" onClick={onSearch} />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
            placeholder= {placeText}
            className="flex-1 py-2 px-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBox