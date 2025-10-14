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

// --- tiny util: produce ISO range (inclusive day)
const toStartOfDayISO = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();
const toEndOfDayISO   = (d: string) => new Date(`${d}T23:59:59.999Z`).toISOString();

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

  // --- NEW: date range state (yyyy-mm-dd)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // centralize fetch with current filters
  const fetchTasks = async (opts?: { reset?: boolean }) => {
    const filters: Record<string, any> = {};
    if (user?.role === "admin") filters.userId = userId;

    if (!opts?.reset) {
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      // --- NEW: attach date range if present
      if (fromDate) filters.createdFrom = toStartOfDayISO(fromDate);
      if (toDate)   filters.createdTo   = toEndOfDayISO(toDate);
      // ^^^ If your API expects different keys, rename here (e.g., startDate/endDate).
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
    // optional sanity: if only one side picked, we still apply
    await fetchTasks();
  };

  const resetDateFilter = async () => {
    setFromDate("");
    setToDate("");
    await fetchTasks(); // refetch without date filters (keeps search unless you also clear it)
  };

  const clearAllFilters = async () => {
    setFromDate("");
    setToDate("");
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
              Expand
            </Button>
            <Button
              variant={viewMode === "completed" ? "default" : "outline"}
              onClick={() => setViewMode("completed")}
              className="h-8 px-3 text-xs"
            >
              Deleted
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
        {/* NEW: Date range bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-[56px]">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-[56px]">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 rounded-md border px-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
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
