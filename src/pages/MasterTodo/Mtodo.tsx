/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { Layers, PlusCircle } from "lucide-react";
import { TaskList } from "./TaskList";
import { createTaskFormAtom, defaultFormState, getTasks, tasksAtom, viewModeAtom } from "./mTodoStore";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { getIncorporationList } from "@/services/dataFetch";
import { allCompListAtom } from "@/services/state";
import SearchBox from "./SearchBox";

/** ---------------- utils ------------------ */
const toStartOfDayISO = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();
const toEndOfDayISO   = (d: string) => new Date(`${d}T23:59:59.999Z`).toISOString();

// yyyy-mm-dd formatter (local)
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// quick range types
type QuickRange = "LAST_7" | "LAST_14" | "THIS_MONTH" | "LAST_2_MONTHS";

// compute [from,to] (yyyy-mm-dd) for quick ranges
const computeRange = (qr: QuickRange): [string, string] => {
  const today = new Date();
  const end = fmt(today);

  if (qr === "LAST_7") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6); // inclusive last 7 days
    return [fmt(start), end];
  }
  if (qr === "LAST_14") {
    const start = new Date(today);
    start.setDate(start.getDate() - 13); // inclusive last 14 days
    return [fmt(start), end];
  }
  if (qr === "THIS_MONTH") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return [fmt(start), end];
  }
  // LAST_2_MONTHS = from first day of previous month up to today
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return [fmt(start), end];
};

/** ---------------- chips ------------------ */
const pastelByQuick: Record<QuickRange, string> = {
  LAST_7: "bg-blue-100 text-blue-900 border-blue-200",
  LAST_14: "bg-teal-100 text-teal-900 border-teal-200",
  THIS_MONTH: "bg-amber-100 text-amber-900 border-amber-200",
  LAST_2_MONTHS: "bg-purple-100 text-purple-900 border-purple-200",
};

const QuickRangeChips = ({
  selected,
  onSelect,
}: {
  selected: QuickRange | null;
  onSelect: (qr: QuickRange) => void;
}) => {
  const items: Array<{ key: QuickRange; label: string }> = [
    { key: "LAST_7", label: "Last 7 days" },
    { key: "LAST_14", label: "Last 14 days" },
    { key: "THIS_MONTH", label: "This month" },
    { key: "LAST_2_MONTHS", label: "Last 2 months" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(({ key, label }) => (
        <FilterChip
          key={key}
          label={label}
          active={selected === key}
          onClick={() => onSelect(key)}
          pastelClass={pastelByQuick[key]}
        />
      ))}
    </div>
  );
};

const FilterChip: React.FC<{
  label: string;
  active?: boolean;
  onClick: () => void;
  pastelClass: string;
}> = ({ label, active, onClick, pastelClass }) => (
  <button
    type="button"
    aria-pressed={!!active}
    onClick={onClick}
    className={[
      "rounded-full border px-2.5 py-1 text-xs font-medium transition",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
      pastelClass,
      active
        ? "border-2 border-current ring-2 ring-current/40 ring-offset-1 shadow-sm"
        : "border-transparent hover:border-current/40",
    ].join(" ")}
  >
    {label}
  </button>
);

/** ---------------- main ------------------ */
const ToDoList = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [openDialog, setOpenDialog] = useState(false);
  const [, setFormState] = useAtom(createTaskFormAtom);
  const [, setListState] = useAtom(tasksAtom);
  const [, setAllList] = useAtom(allCompListAtom);

  const user = useMemo(
    () => (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null),
    []
  );
  const userId = user ? user.id : "";

  // search + focus
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // date range (yyyy-mm-dd)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // quick range state (exclusive)
  const [quick, setQuick] = useState<QuickRange | null>(null);

  // sync quick chip → date inputs (no fetch yet; user must click Apply)
  const handleQuickSelect = (qr: QuickRange) => {
    setQuick((curr) => (curr === qr ? null : qr)); // toggle off if clicked again
    const [from, to] = computeRange(qr);
    setFromDate(from);
    setToDate(to);
  };

  // centralize fetch with current filters
  const fetchTasks = async (opts?: { reset?: boolean }) => {
    const filters: Record<string, any> = {};
    if (user?.role === "admin") filters.userId = userId;

    if (!opts?.reset) {
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (fromDate) filters.createdFrom = toStartOfDayISO(fromDate);
      if (toDate)   filters.createdTo   = toEndOfDayISO(toDate);
    }

    const response = await getTasks(filters);
    setListState(response);
  };

  useEffect(() => {
    const bootstrap = async () => {
      await fetchTasks();
      const result = await getIncorporationList();
      setAllList(result.allCompanies);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTaskAction = () => {
    setOpenDialog(true);
    setFormState(defaultFormState);
  };

  const handleSearch = async () => {
    await fetchTasks();
  };

  const applyDateFilter = async () => {
    await fetchTasks();
  };

  const resetDateFilter = async () => {
    setFromDate("");
    setToDate("");
    setQuick(null);
    await fetchTasks();
  };

  const clearAllFilters = async () => {
    setFromDate("");
    setToDate("");
    setQuick(null);
    setSearchQuery("");
    await fetchTasks({ reset: true });
  };

  return (
    <div className="container mx-auto max-width">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">To-do List</h1>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {/* Top controls: view-mode + search + create */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          {/* Left-aligned buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={viewMode === "grouped" ? "default" : "outline"}
              onClick={() => setViewMode("grouped")}
              className="h-8 px-3 text-xs"
            >
              <Layers className="mr-2 h-4 w-4" />
              Group By Status
            </Button>
            <Button
              variant={viewMode === "expanded" ? "default" : "outline"}
              onClick={() => setViewMode("expanded")}
              className="h-8 px-3 text-xs"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Active Tasks
            </Button>
            <Button
              variant={viewMode === "completed" ? "default" : "outline"}
              onClick={() => setViewMode("completed")}
              className="h-8 px-3 text-xs"
            >
              Completed
            </Button>
            <Button
              variant={viewMode === "ganttChart" ? "default" : "outline"}
              onClick={() => setViewMode("ganttChart")}
              className="h-8 px-3 text-xs"
            >
              Gantt Chart
            </Button>
          </div>

          {/* Right-aligned search + button */}
          <div className="flex items-center gap-4">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              placeText="Search With Task Name/ Description/ Assignee Name"
            />
            <Button onClick={createTaskAction} className="h-8 px-3 text-xs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create new task
            </Button>
          </div>
        </div>

        {/* Date range bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick range chips */}
          <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-[56px]">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setQuick(null); // manual override clears quick selection
                }}
                className="h-8 rounded-md border px-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-[56px]">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setQuick(null); // manual override clears quick selection
                }}
                className="h-8 rounded-md border px-2 text-sm"
              />
            </div>

          {/* manual dates */}
          <div className="flex items-center gap-2 ml-auto">
            
            <QuickRangeChips selected={quick} onSelect={handleQuickSelect} />    
            <Button onClick={applyDateFilter} className="h-8 px-3 text-xs">
              Apply
            </Button>
            <Button variant="outline" onClick={resetDateFilter} className="h-8 px-3 text-xs">
              Reset Dates
            </Button>
            <Button variant="ghost" onClick={clearAllFilters} className="h-8 px-3 text-xs">
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <TaskList />
      <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
    </div>
  );
};

export default ToDoList;
