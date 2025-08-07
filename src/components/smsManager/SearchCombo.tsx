import { useEffect, useRef, useState } from "react";

export type User = {
  id: string;
  name: string;
  phone?: string;
};

export default function UserSearchComboBox({
  users,
  onSelect,
  label = "Select User",
}: {
  users: User[];
  onSelect: (user: User) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<User[]>(users);
  const [selected, setSelected] = useState<User | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          (u.phone ?? "").includes(query)
      )
    );
  }, [query, users]);

  // Close when clicking outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative w-full" ref={ref}>
      <label className="block font-semibold mb-1 text-gray-900 dark:text-gray-100">
        {label}
      </label>

      <button
        type="button"
        className="w-full px-3 py-2 text-left border rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        {selected ? (
          <>
            <span className="text-gray-900 dark:text-gray-100">{selected.name}</span>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {selected.phone || "Phone N/A"}
            </span>
          </>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">
            Search and select user…
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl">
          <div className="p-2">
            <input
              autoFocus
              type="text"
              className="w-full px-2 py-1 mb-2 border border-gray-300 dark:border-gray-600 rounded outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Search users…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                No users found
              </div>
            )}

            {filtered.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                onClick={() => {
                  setSelected(user);
                  onSelect(user);
                  setOpen(false);
                }}
              >
                <span>{user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.phone || "Phone N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
