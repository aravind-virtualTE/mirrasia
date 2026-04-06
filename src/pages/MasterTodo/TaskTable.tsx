/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import {
  Task,
  tasksAtom,
  createTaskFormAtom,
  deleteTask,
  statusColors,
  priorityColors,
  TaskStatus,
  TaskPriority,
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
import { toast } from "@/hooks/use-toast";

/* ----------------------------- helpers / UI ----------------------------- */

type Density = "compact" | "ultra";

const DENSITY_STYLES: Record<Density, { row: string; cellPadY: string; text: string }> = {
  ultra: { row: "h-10", cellPadY: "py-1", text: "text-[13px]" },
  compact: { row: "h-9", cellPadY: "py-0.5", text: "text-[12px]" },
};

const FilterChip: React.FC<{ label: string; active?: boolean; muted?: boolean; onClick: () => void; pastelClass: string }> = ({ label, active, muted, onClick, pastelClass }) => (
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
      muted ? "opacity-55" : "",
    ].join(" ")}
  >
    {label}
  </button>
);

interface TaskTableProps {
  tasks: Task[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: string) => void;
  statusFilter?: TaskStatus[];
  onStatusFilterChange?: (statuses: TaskStatus[]) => void;
  priorityFilter?: TaskPriority[];
  onPriorityFilterChange?: (priorities: TaskPriority[]) => void;
  onTaskMutated?: () => void;
}

const TaskTable = ({
  tasks,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  onSortChange: externalOnSortChange,
  statusFilter: externalStatusFilter,
  onStatusFilterChange: externalOnStatusFilterChange,
  priorityFilter: externalPriorityFilter,
  onPriorityFilterChange: externalOnPriorityFilterChange,
  onTaskMutated,
}: TaskTableProps) => {
  // Fallback to local state when not controlled by parent
  const [localSortBy, setLocalSortBy] = useState("createdAt");
  const [localSortOrder, setLocalSortOrder] = useState<"asc" | "desc">("desc");
  const [localStatusFilter, setLocalStatusFilter] = useState<TaskStatus[]>([]);
  const [localPriorityFilter, setLocalPriorityFilter] = useState<TaskPriority[]>([]);

  const sortBy = externalSortBy ?? localSortBy;
  const sortOrder = externalSortOrder ?? localSortOrder;
  const onSortChange = externalOnSortChange ?? ((field: string) => {
    if (localSortBy === field) setLocalSortOrder((o) => o === "asc" ? "desc" : "asc");
    else { setLocalSortBy(field); setLocalSortOrder("asc"); }
  });
  const statusFilter = externalStatusFilter ?? localStatusFilter;
  const onStatusFilterChange = externalOnStatusFilterChange ?? setLocalStatusFilter;
  const priorityFilter = externalPriorityFilter ?? localPriorityFilter;
  const onPriorityFilterChange = externalOnPriorityFilterChange ?? setLocalPriorityFilter;
  const [, setFormState] = useAtom(createTaskFormAtom);
  const [, setAllTasks] = useAtom(tasksAtom);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [popupTask, setPopupTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [density, setDensity] = useState<Density>("ultra");

  // Overdue is a client-side computed filter (not stored in DB)
  const [overdueOnly, setOverdueOnly] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const toggleStatus = (s: TaskStatus) => {
    const current = new Set(statusFilter);
    if (current.has(s)) {
      current.delete(s);
    } else {
      current.add(s);
    }
    onStatusFilterChange(Array.from(current));
  };

  const togglePriority = (p: TaskPriority) => {
    const current = new Set(priorityFilter);
    if (current.has(p)) {
      current.delete(p);
    } else {
      current.add(p);
    }
    onPriorityFilterChange(Array.from(current));
  };

  const clearFilters = () => {
    onStatusFilterChange([]);
    onPriorityFilterChange([]);
    setOverdueOnly(false);
  };

  const handleEditClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormState({
      taskName: task.name,
      description: task.description || "",
      comment: "",
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      selectedUsers: task.assignees.map((a) => ({ id: a.id || "", name: a.name })),
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
      try {
        await deleteTask(taskToDelete._id);
        setAllTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
        toast({ title: "Task deleted" });
      } catch {
        toast({ title: "Failed to delete task", variant: "destructive" });
      }
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

  // Client-side overdue filter (computed field, can't be server-side)
  const displayTasks = useMemo(() => {
    if (!overdueOnly) return tasks;
    const todayStart = startOfDay(new Date());
    return tasks.filter(
      (t) => !!t.dueDate && isBefore(new Date(t.dueDate), todayStart) && t.status !== "COMPLETED"
    );
  }, [tasks, overdueOnly]);

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

  const priorityPastels: Record<TaskPriority, string> = {
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

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  /* -------------------------------- render -------------------------------- */
  const d = DENSITY_STYLES[density];
  const statusFilterSet = new Set(statusFilter);
  const priorityFilterSet = new Set(priorityFilter);

  return (
    <>
      {/* Chip filter bar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["TO DO", "IN PROGRESS", "IN REVIEW"] as TaskStatus[]).map((s) => (
            <FilterChip
              key={s}
              label={s.replace("IN ", "")}
              active={statusFilterSet.has(s)}
              onClick={() => toggleStatus(s)}
              pastelClass={statusPastels[s]}
            />
          ))}
        </div>

        <div className="ml-2 flex flex-wrap items-center gap-1.5">
          {(["Urgent", "High", "Medium", "Low"] as TaskPriority[]).map((p) => (
            <FilterChip
              key={p}
              label={p}
              active={priorityFilterSet.has(p)}
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
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-auto">
          <Table className={`compact-table w-full table-fixed ${d.text} min-w-[1120px]`}>
            <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm">
              <TableRow className={`${d.row}`}>
                <TableHead className="w-[84px] sticky top-0 z-30 bg-gray-50">Status</TableHead>
                <TableHead className="w-auto sticky top-0 z-30 bg-gray-50 cursor-pointer" onClick={() => onSortChange("name")}>
                  <div className="flex items-center">Task <SortIcon field="name" /></div>
                </TableHead>
                <TableHead className="w-[180px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("company.name")}>
                  <div className="flex items-center">Company <SortIcon field="company.name" /></div>
                </TableHead>
                <TableHead className="w-[180px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("project.name")}>
                  <div className="flex items-center">Project <SortIcon field="project.name" /></div>
                </TableHead>
                <TableHead className="w-[160px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("assignees.name")}>
                  <div className="flex items-center">Assignee <SortIcon field="assignees.name" /></div>
                </TableHead>
                <TableHead className="w-[112px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("dueDate")}>
                  <div className="flex items-center">Due <SortIcon field="dueDate" /></div>
                </TableHead>
                <TableHead className="w-[100px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("priority")}>
                  <div className="flex items-center">Priority <SortIcon field="priority" /></div>
                </TableHead>
                <TableHead className="w-[136px] cursor-pointer sticky top-0 z-30 bg-gray-50" onClick={() => onSortChange("createdAt")} title="Sort by created date">
                  <div className="flex items-center">Created At <SortIcon field="createdAt" /></div>
                </TableHead>
                <TableHead className="w-[88px] sticky top-0 z-30 bg-gray-50">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {displayTasks.map((task) => (
                <TableRow
                  onClick={() => handleRowClick(task)}
                  key={task._id}
                  className={`${d.row} cursor-pointer`}
                >
                  <TableCell className={`${d.cellPadY}`}>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${statusColors[task.status]}`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    <div className="min-w-0" title={task.name}>
                      <span className="block truncate font-medium leading-5">{task.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    <div className="min-w-0" title={task.company?.name || "-"}>
                      <span className="block truncate">{task.company?.name || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    <div className="min-w-0" title={task.project?.name || "-"}>
                      <span className="block truncate">{task.project?.name || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>{renderAssignees(task.assignees)}</TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    {task.dueDate ? formatToDDMMYYYY(task.dueDate) : "-"}
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    <div className="flex items-center gap-1">
                      <Flag className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`} fill="currentColor" />
                      <span>{task.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`}>
                    {task.createdAt ? formatToDDMMYYYY(task.createdAt) : "-"}
                  </TableCell>
                  <TableCell className={`${d.cellPadY}`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-1">
                      {user?.role !== "user" && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => handleEditClick(task, e)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {task.status === "COMPLETED" && user?.role === "master" && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => handleDeleteClick(task, e)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRowClick(task)}>
                        <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Task"
          description={
            <>
              Are you sure you want to Delete{" "}
              <span className="font-medium text-red-600">{taskToDelete?.name}</span>?
            </>
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
        />
      </div>

      {popupTask && (
        <TaskDetailPopup taskId={popupTask?._id ?? null} onClose={() => setPopupTask(null)} />
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
