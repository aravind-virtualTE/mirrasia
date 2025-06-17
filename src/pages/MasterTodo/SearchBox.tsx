import { Search } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  isFocused: boolean;
  setIsFocused: (val: boolean) => void;
};

const SearchBox = ({ value, onChange, onSearch, isFocused, setIsFocused }: SearchBoxProps) => {
  return (
    <div className="w-[300px]">
      <div className="relative">
        <div
          className={`
            flex items-center w-full rounded-full border transition-all duration-200 bg-white
            ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-sm hover:shadow-md'}
          `}
        >
          <div className="pl-4 pr-3 cursor-pointer">
            <Search className="h-5 w-5 text-gray-400" onClick={onSearch} />
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
            placeholder="Search With Task Name/ Description"
            className="flex-1 py-3 px-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBox