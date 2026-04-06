/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { Layers, Loader2, PlusCircle } from "lucide-react";
import { TaskList } from "./TaskList";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  createTaskFormAtom,
  defaultFormState,
  getTasks,
  paginationAtom,
  PaginationMeta,
  tasksAtom,
  TaskStatus,
  TaskPriority,
  viewModeAtom,
} from "./mTodoStore";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { getAllCompanyNames } from "@/services/dataFetch";
import { allCompNameAtom } from "@/services/state";
import SearchBox from "./SearchBox";
import { toast } from "@/hooks/use-toast";

/** ---------------- utils ------------------ */
const toStartOfDayISO = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();
const toEndOfDayISO = (d: string) => new Date(`${d}T23:59:59.999Z`).toISOString();

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

type QuickRange = "LAST_7" | "LAST_14" | "THIS_MONTH" | "LAST_2_MONTHS";

const computeRange = (qr: QuickRange): [string, string] => {
  const today = new Date();
  const end = fmt(today);
  if (qr === "LAST_7") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return [fmt(start), end];
  }
  if (qr === "LAST_14") {
    const start = new Date(today);
    start.setDate(start.getDate() - 13);
    return [fmt(start), end];
  }
  if (qr === "THIS_MONTH") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return [fmt(start), end];
  }
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

/** ---------------- pagination UI ------------------ */
const PaginationBar = ({
  pagination,
  onPageChange,
  loading,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  loading: boolean;
}) => {
  if (!pagination || pagination.total === 0) return null;

  const { page, totalPages, total, pageSize } = pagination;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white/50 px-4 py-4 mt-6 gap-4 rounded-b-lg">
      <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
        Showing <span className="font-medium text-foreground">{from}</span> to <span className="font-medium text-foreground">{to}</span> of <span className="font-medium text-foreground">{total}</span> tasks
      </div>
      {totalPages > 1 && (
        <Pagination className="w-full sm:w-auto mx-0 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (page > 1 && !loading) onPageChange(page - 1); }}
                className={page <= 1 || loading ? "pointer-events-none opacity-50" : "hover:bg-slate-100 cursor-pointer"}
              />
            </PaginationItem>

            {getPageNumbers().map((p, i) => (
              <PaginationItem key={i}>
                {p === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (!loading) onPageChange(p as number); }}
                    isActive={page === p}
                    className={loading ? "pointer-events-none" : "hover:bg-slate-100 cursor-pointer"}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (page < totalPages && !loading) onPageChange(page + 1); }}
                className={page >= totalPages || loading ? "pointer-events-none opacity-50" : "hover:bg-slate-100 cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

/** ---------------- main ------------------ */
const ToDoList = () => {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [openDialog, setOpenDialog] = useState(false);
  const [, setFormState] = useAtom(createTaskFormAtom);
  const [, setListState] = useAtom(tasksAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [, setAllList] = useAtom(allCompNameAtom);
  const [loading, setLoading] = useState(false);

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
  const [dateError, setDateError] = useState<string>("");

  // quick range state
  const [quick, setQuick] = useState<QuickRange | null>(null);

  // server-side sort (lifted from TaskTable)
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // server-side status/priority filters (lifted from TaskTable)
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>([]);

  // current page
  const [currentPage, setCurrentPage] = useState(1);

  // centralize fetch with all filters
  const fetchTasks = useCallback(async (opts?: { reset?: boolean; page?: number }) => {
    const filters: Record<string, any> = {};
    if (user?.role === "admin") filters.userId = userId;

    if (!opts?.reset) {
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (fromDate) filters.createdFrom = toStartOfDayISO(fromDate);
      if (toDate) filters.createdTo = toEndOfDayISO(toDate);
      if (statusFilter.length > 0) filters.status = statusFilter.join(",");
      if (priorityFilter.length > 0) filters.priority = priorityFilter.join(",");
    }

    filters.sortBy = sortBy;
    filters.order = sortOrder;
    filters.page = opts?.page ?? currentPage;
    filters.pageSize = 20;

    setLoading(true);
    try {
      const response = await getTasks(filters);
      setListState(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination);
    } catch {
      toast({ title: "Failed to load tasks", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, fromDate, toDate, statusFilter, priorityFilter, sortBy, sortOrder, currentPage, userId, user?.role]);

  useEffect(() => {
    const bootstrap = async () => {
      await fetchTasks();
      try {
        const result = await getAllCompanyNames();
        setAllList(result);
      } catch {
        // company names are non-critical
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch when sort/filter/page changes (skip initial mount)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) { setMounted(true); return; }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, currentPage, statusFilter, priorityFilter]);

  // quick chip auto-applies
  const handleQuickSelect = async (qr: QuickRange) => {
    const isToggleOff = quick === qr;
    setQuick(isToggleOff ? null : qr);
    if (isToggleOff) {
      setFromDate("");
      setToDate("");
      setDateError("");
      setCurrentPage(1);
      // fetch with reset dates
      const filters: Record<string, any> = {};
      if (user?.role === "admin") filters.userId = userId;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (statusFilter.length > 0) filters.status = statusFilter.join(",");
      if (priorityFilter.length > 0) filters.priority = priorityFilter.join(",");
      filters.sortBy = sortBy;
      filters.order = sortOrder;
      filters.page = 1;
      filters.pageSize = 20;
      setLoading(true);
      try {
        const response = await getTasks(filters);
        setListState(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination);
      } catch {
        toast({ title: "Failed to load tasks", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    } else {
      const [from, to] = computeRange(qr);
      setFromDate(from);
      setToDate(to);
      setDateError("");
      setCurrentPage(1);
      // fetch with new dates directly (avoid stale closure)
      const filters: Record<string, any> = {};
      if (user?.role === "admin") filters.userId = userId;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      filters.createdFrom = toStartOfDayISO(from);
      filters.createdTo = toEndOfDayISO(to);
      if (statusFilter.length > 0) filters.status = statusFilter.join(",");
      if (priorityFilter.length > 0) filters.priority = priorityFilter.join(",");
      filters.sortBy = sortBy;
      filters.order = sortOrder;
      filters.page = 1;
      filters.pageSize = 20;
      setLoading(true);
      try {
        const response = await getTasks(filters);
        setListState(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination);
      } catch {
        toast({ title: "Failed to load tasks", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  const createTaskAction = () => {
    setOpenDialog(true);
    setFormState(defaultFormState);
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    await fetchTasks({ page: 1 });
  };

  const applyDateFilter = async () => {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("'From' date cannot be after 'To' date");
      return;
    }
    setDateError("");
    setCurrentPage(1);
    await fetchTasks({ page: 1 });
  };

  const resetDateFilter = async () => {
    setFromDate("");
    setToDate("");
    setQuick(null);
    setDateError("");
    setCurrentPage(1);
    await fetchTasks({ reset: true, page: 1 });
  };

  const clearAllFilters = async () => {
    setFromDate("");
    setToDate("");
    setQuick(null);
    setSearchQuery("");
    setDateError("");
    setStatusFilter([]);
    setPriorityFilter([]);
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    await fetchTasks({ reset: true, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (statuses: TaskStatus[]) => {
    setStatusFilter(statuses);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (priorities: TaskPriority[]) => {
    setPriorityFilter(priorities);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto max-width">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">To-do List</h1>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {/* Top controls: view-mode + search + create */}
        <div className="flex flex-wrap justify-between items-center gap-3">
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

          <div className="flex items-center gap-4">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              placeText="Search tasks..."
            />
            <Button onClick={createTaskAction} className="h-8 px-3 text-xs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create new task
            </Button>
          </div>
        </div>

        {/* Date range bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-[56px]">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setQuick(null);
                setDateError("");
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
                setQuick(null);
                setDateError("");
              }}
              className="h-8 rounded-md border px-2 text-sm"
            />
          </div>
          {dateError && (
            <span className="text-xs text-red-600 font-medium">{dateError}</span>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <QuickRangeChips selected={quick} onSelect={handleQuickSelect} />
            <Button onClick={applyDateFilter} className="h-8 px-3 text-xs" disabled={loading}>
              Apply
            </Button>
            <Button variant="outline" onClick={resetDateFilter} className="h-8 px-3 text-xs" disabled={loading}>
              Reset Dates
            </Button>
            <Button variant="ghost" onClick={clearAllFilters} className="h-8 px-3 text-xs" disabled={loading}>
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <TaskList
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={handlePriorityFilterChange}
        onTaskMutated={() => fetchTasks()}
      />

      <PaginationBar
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <CreateTaskDialog open={openDialog} onOpenChange={setOpenDialog} />
    </div>
  );
};

export default ToDoList;
