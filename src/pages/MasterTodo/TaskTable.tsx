/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import {
  Task,
  tasksAtom,
  createTaskFormAtom,
  users,
  deleteTask,
  statusColors,
  priorityColors,
  TaskStatus,
} from "./mTodoStore";
import {
  Edit,
  Flag,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { isBefore, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { CreateTaskDialog } from "./CreateTaskDialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TaskDetailPopup from "./TaskDetailPopup";
import { formatToDDMMYYYY } from "@/middleware";

/* ----------------------------- helpers / UI ----------------------------- */

type Density = "compact" | "ultra";

const DENSITY_STYLES: Record<Density, { row: string; cellPadY: string; text: string }> = {
  ultra: { row: "h-10", cellPadY: "py-1", text: "text-[13px]" },
  compact: { row: "h-9", cellPadY: "py-0.5", text: "text-[12px]" },
};

const priorityOrder = { Low: 1, Medium: 2, High: 3, Urgent: 4 } as const;

// Deterministic pastel from string
const hueFromString = (s: string) =>
  Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

const CompanyBadge: React.FC<{ name?: string }> = ({ name }) => {
  if (!name) return null;
  const hue = hueFromString(name);
  const bg = `hsl(${hue} 80% 96%)`;
  const ring = `hsl(${hue} 70% 84%)`;
  const chip = `hsl(${hue} 85% 90%)`;
  const txt = `hsl(${hue} 30% 30%)`;

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 max-w-[180px] sm:max-w-[220px]"
            style={{ backgroundColor: bg, borderColor: ring, color: txt }}
            title={name}
          >
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold flex-shrink-0"
              style={{ backgroundColor: chip }}
            >
              {initials}
            </span>
            <span className="truncate leading-4">{name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const FilterChip: React.FC<{ label: string; active?: boolean; muted?: boolean; onClick: () => void; pastelClass: string; }> = ({ label, active, muted, onClick, pastelClass }) => (
  <button
    type="button"
    aria-pressed={!!active}
    onClick={onClick}
    className={[
      // base
      "rounded-full border px-2.5 py-1 text-xs font-medium transition",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-1",
      pastelClass,
      // visual states
      active
        ? // Heavier border + color-matched ring; uses the chip's text color via `currentColor`
        "border-2 border-current ring-2 ring-current/40 ring-offset-1 shadow-sm"
        : "border-transparent hover:border-current/40",
      muted ? "opacity-55" : "",
    ].join(" ")}
  >
    {label}
  </button>
);

const TaskTable = ({ tasks }: { tasks: Task[] }) => {
  const [, setFormState] = useAtom(createTaskFormAtom);
  const [, setAllTasks] = useAtom(tasksAtom);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [popupTask, setPopupTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  type SortField = "dueDate" | "priority" | "assignees" | "createdAt";
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [density, setDensity] = useState<Density>("ultra");

  // new: pastel chip filters
  const [statusFilter, setStatusFilter] = useState<Set<TaskStatus>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<Set<Task["priority"]>>(
    new Set()
  );
  const [overdueOnly, setOverdueOnly] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const toggleStatus = (s: TaskStatus) => {
    const next = new Set(statusFilter);
    if (next.has(s)) {
      next.delete(s);
    } else {
      next.add(s);
    }
    setStatusFilter(next);
  };
  const togglePriority = (p: Task["priority"]) => {
    const next = new Set(priorityFilter);
    if (next.has(p)) {
      next.delete(p);
    } else {
      next.add(p);
    }
    setPriorityFilter(next);
  };

  const clearFilters = () => {
    setStatusFilter(new Set());
    setPriorityFilter(new Set());
    setOverdueOnly(false);
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const assigneeNames = task.assignees.map((a) => a.name);
    const selectedUserObjects = users.filter((u) => assigneeNames.includes(u.name));
    setFormState({
      taskName: task.name,
      description: task.description || "",
      comment: "",
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      selectedUsers: selectedUserObjects,
      selectedCompany: task.company,
      selectedProject: task.project,
    });
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete?._id) {
      await deleteTask(taskToDelete._id);
      setAllTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleRowClick = (task: Task) => setPopupTask(task);

  const renderAssignees = (assigneeNames: { id?: string; name: string }[]) => {
    if (!assigneeNames?.length) return null;
    if (assigneeNames.length <= 2) {
      return (
        <div className="truncate">
          {assigneeNames.map((a, i) => (
            <span key={a.id || i}>
              {a.name}
              {i < assigneeNames.length - 1 && ", "}
            </span>
          ))}
        </div>
      );
    }
    const MAX = 3;
    return (
      <div className="flex items-center space-x-1">
        {assigneeNames.slice(0, MAX).map((item, idx) => (
          <TooltipProvider key={idx} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Avatar className="h-5 w-5 border bg-muted">
                    <AvatarFallback className="text-[9px] font-medium">
                      {getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>{item.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {assigneeNames.length > MAX && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-700 border">
                  +{assigneeNames.length - MAX}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {assigneeNames.slice(MAX).map((a) => a.name).join(", ")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0].substring(0, 2).toUpperCase();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    const todayStart = startOfDay(new Date());
    return tasks.filter((t) => {
      const statusPass =
        statusFilter.size === 0 || statusFilter.has(t.status as TaskStatus);
      const priorityPass =
        priorityFilter.size === 0 || priorityFilter.has(t.priority);
      const overduePass = !overdueOnly
        ? true
        : !!t.dueDate &&
        isBefore(new Date(t.dueDate), todayStart) &&
        t.status !== "COMPLETED";
      return statusPass && priorityPass && overduePass;
    });
  }, [tasks, statusFilter, priorityFilter, overdueOnly]);

  const sortedTasks = useMemo(() => {
    const arr = [...filtered];
    if (!sortField) return arr;
    return arr.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (!aVal) return sortOrder === "asc" ? 1 : -1;
      if (!bVal) return sortOrder === "asc" ? -1 : 1;

      if (sortField === "dueDate" || sortField === "createdAt") {
        const aDate = aVal instanceof Date ? aVal.getTime() : new Date(aVal).getTime();
        const bDate = bVal instanceof Date ? bVal.getTime() : new Date(bVal).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }
      if (sortField === "priority") {
        return sortOrder === "asc"
          ? priorityOrder[aVal as keyof typeof priorityOrder] -
          priorityOrder[bVal as keyof typeof priorityOrder]
          : priorityOrder[bVal as keyof typeof priorityOrder] -
          priorityOrder[aVal as keyof typeof priorityOrder];
      }
      if (sortField === "assignees") {
        const first = (t: Task) =>
          t.assignees?.length
            ? t.assignees.map((x) => x.name.toLowerCase()).sort()[0] || ""
            : "";
        const aName = first(a);
        const bName = first(b);
        if (aName < bName) return sortOrder === "asc" ? -1 : 1;
        if (aName > bName) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>No To-do tasks available</p>
      </div>
    );
  }

  /* ------------------------------ UI: chips ------------------------------ */
  const statusPastels: Record<TaskStatus, string> = {
    "TO DO": "bg-blue-100 text-blue-900 border-blue-200",
    "IN PROGRESS": "bg-green-100 text-green-900 border-green-200",
    "IN REVIEW": "bg-orange-100 text-orange-900 border-orange-200",
    COMPLETED: "bg-purple-100 text-purple-900 border-purple-200",
  };

  const priorityPastels: Record<Task["priority"], string> = {
    Low: "bg-gray-50 text-gray-800 border-gray-200",
    Medium: "bg-blue-50 text-blue-900 border-blue-200",
    High: "bg-orange-50 text-orange-900 border-orange-200",
    Urgent: "bg-rose-50 text-rose-900 border-rose-200",
  };

  const densityBtn = (val: Density, label: string) => (
    <Button
      variant={density === val ? "default" : "outline"}
      size="sm"
      className="h-7 px-2 text-[12px]"
      onClick={() => setDensity(val)}
    >
      {label}
    </Button>
  );

  /* -------------------------------- render -------------------------------- */
  const d = DENSITY_STYLES[density];

  return (
    <>
      {/* Chip filter bar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {/* Status chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["TO DO", "IN PROGRESS", "IN REVIEW",] as TaskStatus[]).map(
            (s) => (
              <FilterChip
                key={s}
                label={s.replace("IN ", "")}
                active={statusFilter.has(s)}
                onClick={() => toggleStatus(s)}
                pastelClass={statusPastels[s]}
              />
            )
          )}
        </div>

        {/* Priority chips */}
        <div className="ml-2 flex flex-wrap items-center gap-1.5">
          {(["Urgent", "High", "Medium", "Low"] as Task["priority"][]).map((p) => (
            <FilterChip
              key={p}
              label={p}
              active={priorityFilter.has(p)}
              onClick={() => togglePriority(p)}
              pastelClass={priorityPastels[p]}
            />
          ))}
          <FilterChip
            label="Overdue"
            active={overdueOnly}
            onClick={() => setOverdueOnly((v) => !v)}
            pastelClass="bg-red-50 text-red-900 border-red-200"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {densityBtn("compact", "Compact")}
          {densityBtn("ultra", "Ultra")}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[12px]"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table className={`compact-table w-full table-fixed ${d.text}`}>
          <TableHeader className="bg-gray-50">
            <TableRow className={`${d.row}`}>
              <TableHead className="w-[84px]">Status</TableHead>

              {/* Task column is elastic with an upper bound; truncates like Excel */}
              <TableHead className="w-auto">Task</TableHead>

              <TableHead
                className="w-[160px] cursor-pointer"
                onClick={() => handleSort("assignees")}
              >
                <div className="flex items-center">
                  Assignee{" "}
                  {sortField === "assignees" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead
                className="w-[112px] cursor-pointer"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due{" "}
                  {sortField === "dueDate" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead
                className="w-[100px] cursor-pointer"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority{" "}
                  {sortField === "priority" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              {/* NEW: Created column, placed beside Actions (to its left) */}
              <TableHead
                className="w-[136px] cursor-pointer"
                onClick={() => handleSort("createdAt")}
                title="Sort by created date"
              >
                <div className="flex items-center">
                  Created At{" "}
                  {sortField === "createdAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>

              <TableHead className="w-[88px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow
                onClick={() => handleRowClick(task)}
                key={task._id}
                className={`${d.row} cursor-pointer`}
              >
                <TableCell className={`${d.cellPadY}`}>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 ${statusColors[task.status]}`}
                  >
                    {task.status}
                  </Badge>
                </TableCell>

                {/* Elastic task cell: avatar chip + tight truncation */}
                <TableCell className={`${d.cellPadY}`}>
                  <div className="flex w-full items-center justify-between gap-2">
                    <div
                      className="min-w-0 flex-1"
                      title={task.name}
                    >
                      <span className="block truncate font-medium leading-5">
                        {task.name}
                      </span>
                    </div>

                    {/* Fancy company pill */}
                    {task.company?.name && (
                      <CompanyBadge name={task.company.name} />
                    )}
                  </div>
                </TableCell>

                <TableCell className={`${d.cellPadY}`}>
                  {renderAssignees(task.assignees)}
                </TableCell>

                <TableCell className={`${d.cellPadY}`}>
                  {task.dueDate ? formatToDDMMYYYY(task.dueDate) : "-"}
                </TableCell>

                <TableCell className={`${d.cellPadY}`}>
                  <div className="flex items-center gap-1">
                    <Flag
                      className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`}
                      fill={"currentColor"}
                    />
                    <span>{task.priority}</span>
                  </div>
                </TableCell>

                {/* NEW: Created cell */}
                <TableCell className={`${d.cellPadY}`}>
                  {task.createdAt ? (
                   formatToDDMMYYYY(task.createdAt)
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell
                  className={`${d.cellPadY}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex space-x-1">
                    {user?.role !== "user" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleEditClick(task, e)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {task.status === "COMPLETED" && user?.role === "master" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => handleDeleteClick(task, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleRowClick(task)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Task"
          description={
            <>
              Are you sure you want to Delete{" "}
              <span className="font-medium text-red-600">
                {taskToDelete?.name}
              </span>
              ?
            </>
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
        />
      </div>

      {/* Task Detail Popup */}
      {popupTask && (
        <TaskDetailPopup
          taskId={popupTask?._id ?? null}
          onClose={() => setPopupTask(null)}
        />
      )}

      {editDialogOpen && (
        <CreateTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          isEditMode
          taskToEdit={selectedTask}
        />
      )}
    </>
  );
};

export default TaskTable;
