/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";
import { format, parseISO, addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { priorityColors } from "./mTodoStore";

export type RawTask = {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  priority?: string;
  status: "TO DO" | "IN PROGRESS" | "IN REVIEW" | "COMPLETED" | string;
  company?: { id: string; name: string };
  assignees?: { id: string; name: string }[];
};

export interface GanttTimelineProps {
  items: RawTask[];
  cellWidth?: number; // px per day
  rowHeight?: number; // px per row
}

function ensureDate(v?: string) {
  if (!v) return undefined;
  const d = parseISO(v);
  return isNaN(d.getTime()) ? undefined : d;
}

export function GanttChart({ items, cellWidth = 24, rowHeight = 32 }: GanttTimelineProps) {
  const tasks = useMemo(() => {
    return items.map((t) => {
      const start = ensureDate(t.createdAt) ?? new Date();
      const end =
        ensureDate(t.dueDate) ||
        (t.status === "COMPLETED" && ensureDate(t.updatedAt)) ||
        addDays(start, 7);
      return {
        id: t._id,
        name: t.name,
        start: startOfDay(start),
        end: startOfDay(end),
        status: t.status,
        priority: t.priority ?? "",
        companyName: t.company?.name ?? "—",
        assignees: (t.assignees ?? []).map((a) => a.name),
        description: t.description,
      };
    });
  }, [items]);

  const { minDate, days } = useMemo(() => {
    const min = tasks.reduce((acc, t) => (t.start < acc ? t.start : acc), tasks[0]?.start ?? new Date());
    const max = tasks.reduce((acc, t) => (t.end > acc ? t.end : acc), tasks[0]?.end ?? new Date());

    const d: Date[] = [];
    const total = differenceInCalendarDays(max, min) + 1;
    for (let i = 0; i < total; i++) d.push(addDays(min, i));

    return { minDate: min, maxDate: max, days: d };
  }, [tasks]);

  const numDays = days.length;
  const gridTemplate = `repeat(${numDays}, ${cellWidth}px)`;

  const statusClass: Record<string, string> = {
    'TO DO': 'bg-blue-400 ',
    'IN PROGRESS': 'bg-green-400',
    'IN REVIEW': 'bg-orange-400 ',
    'COMPLETED': 'bg-purple-400',
  };
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const statuses = useMemo(() => Array.from(new Set(tasks.map((t) => t.status))).sort(), [tasks]);
  const priorities = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.priority).filter(Boolean))).sort() as string[],
    [tasks]
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (statusFilter === "all" || t.status === statusFilter) &&
          (priorityFilter === "all" || t.priority === priorityFilter)
      ),
    [tasks, statusFilter, priorityFilter]
  );

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-2xl font-semibold">Timeline</h2>
        <div className="ml-auto flex items-center gap-3">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="all">All priorities</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover">
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <Legend label="To Do" className="bg-status-todo" />
            <Legend label="In Progress" className="bg-status-inprogress" />
            <Legend label="In Review" className="bg-status-inreview" />
            <Legend label="Completed" className="bg-status-completed" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex">
          <aside className="w-56 shrink-0 border-r">
            <div className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 h-8">
              <div className="px-3 h-8 flex items-center text-xs font-medium">Task</div>
            </div>
            <div>
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="relative px-3 border-b flex items-center"
                  style={{ height: rowHeight }}
                >
                  <span
                    className={`absolute left-0 top-0 h-full w-1 ${statusClass[t.status] ?? "bg-accent"}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex flex-col">
                    <div className="text-sm font-medium truncate" title={t.name}>
                      {t.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] leading-tight text-muted-foreground">
                      <span className={`truncate`}>{t.status}</span>
                      {t.priority && <span className={`truncate ${priorityColors[t.priority]}`}>{t.priority}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="relative w-full overflow-x-auto">
            {/* Header timeline scale */}
            <div
              className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="min-w-full" style={{ display: "grid", gridTemplateColumns: gridTemplate }}>
                {days.map((d, i) => {
                  const isMonthStart = d.getDate() === 1 || i === 0;
                  return (
                    <div
                      key={i}
                      className="flex h-8 items-end justify-center border-l first:border-l-0"
                      style={{ borderColor: "hsl(var(--timeline-grid))" }}
                    >
                      <div className={`pb-0.5 text-[10px] ${isMonthStart ? "font-semibold" : "text-muted-foreground"}`}>
                        {format(d, isMonthStart ? "MMM d" : "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            <div>
              {filteredTasks.map((t) => {
                const startIdx = Math.max(0, differenceInCalendarDays(t.start, minDate));
                const span = Math.max(1, differenceInCalendarDays(t.end, t.start) + 1);
                return (
                  <div key={t.id} className="relative border-b" style={{ height: rowHeight }}>
                    {/* grid backdrop */}
                    <div className="absolute inset-0 pointer-events-none" style={{ display: "grid", gridTemplateColumns: gridTemplate }}>
                      {days.map((_, i) => (
                        <div key={i} className="border-l first:border-l-0" style={{ borderColor: "hsl(var(--timeline-grid))" }} />
                      ))}
                    </div>

                    {/* bar */}
                    <div className="relative h-full" style={{ display: "grid", gridTemplateColumns: gridTemplate }}>
                      <div
                        className={`group ${statusClass[t.status] ?? "bg-accent"} rounded-md shadow-sm ring-0 hover:ring-2 focus-visible:ring-2 transition-[box-shadow,filter] duration-200`}
                        style={{ gridColumn: `${startIdx + 1} / span ${span}`, height: Math.max(24, rowHeight - 12) }}
                        role="button"
                        aria-label={`${t.name} from ${format(t.start, "PP")} to ${format(t.end, "PP")}`}
                        tabIndex={0}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="h-full w-full rounded-md" />
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start" className="text-xs">
                            <div className="font-medium">{t.name}</div>
                            <div className="text-muted-foreground">
                              {format(t.start, "PP")} – {format(t.end, "PP")}
                            </div>
                            {t.assignees.length > 0 && <div>Assignees: {t.assignees.join(", ")}</div>}
                            {t.priority && <div>Priority: {t.priority}</div>}
                            <div>Status: {t.status}</div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${className}`} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export default GanttChart;