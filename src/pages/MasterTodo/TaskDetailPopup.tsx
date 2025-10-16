/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import { format, startOfDay, isBefore } from "date-fns";
import { Flag, X, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  priorityColors,
  // statusColors,
  tasksAtom,
  updateTask,
  usersAtom,
  deleteTodoTaskComment, statuses,
  TaskStatus
} from "./mTodoStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { RichTextViewer } from "@/components/rich-text-viewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatInput from "@/common/ChatInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* --------------------------- small helpers / UI --------------------------- */

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
    <div
      className="inline-flex max-w-[260px] items-center gap-1.5 truncate rounded-full border px-2 py-0.5 text-xs"
      style={{ backgroundColor: bg, borderColor: ring, color: txt }}
      title={name}
    >
      <span
        className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{ backgroundColor: chip }}
      >
        {initials}
      </span>
      <span className="truncate">{name}</span>
    </div>
  );
};

const AssigneeGroup: React.FC<{ names: { id?: string; name: string }[] }> = ({ names }) => {
  if (!names?.length) return null;
  if (names.length <= 2)
    return (
      <div className="truncate text-[12px]">
        {names.map((a, i) => (
          <span key={a.id || i}>
            {a.name}
            {i < names.length - 1 && ", "}
          </span>
        ))}
      </div>
    );
  const MAX = 3;
  const getInitials = (name: string) => {
    const p = name.trim().split(" ");
    return p.length > 1 ? p[0][0] + p[1][0] : p[0].slice(0, 2).toUpperCase();
  };
  return (
    <div className="flex items-center space-x-1">
      {names.slice(0, MAX).map((n, i) => (
        <Avatar key={i} className="h-5 w-5 border bg-muted">
          <AvatarFallback className="text-[9px] font-medium">
            {getInitials(n.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {names.length > MAX && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full border bg-gray-100 text-[10px] text-gray-700">
          +{names.length - MAX}
        </div>
      )}
    </div>
  );
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* --------------------------------- component --------------------------------- */

const TaskDetailPopup = ({
  taskId,
  onClose,
}: {
  taskId: string | null;
  onClose: () => void;
}) => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [users] = useAtom(usersAtom);
  const task = tasks.find((t) => t._id === taskId);
  const createdUser = users.find((u) => u._id === task?.userId);
  const commentingUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  // mobile: details/comments segmented switch
  const [mobileTab, setMobileTab] = useState<"details" | "comments">("details");
  const [descExpanded, setDescExpanded] = useState(false);

  // desktop: resizable split
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftWidth, setLeftWidth] = useState(420); // px
  const [resizing, setResizing] = useState(false);

  // comments scroller refs
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const minLeft = 300;
      const minRight = 360;
      const maxLeft = rect.width - minRight;
      setLeftWidth(clamp(x, minLeft, maxLeft));
    };
    const onUp = () => setResizing(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  // scroll to bottom on open and when comments change
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [taskId]);
  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [task?.comments?.length]);

  const isOverdue = useMemo(() => {
    if (!task?.dueDate || task.status === "COMPLETED") return false;
    return isBefore(new Date(task.dueDate), startOfDay(new Date()));
  }, [task]);

  const handleMessageSubmit = async (submissionData: any) => {
    setIsLoading(true);
    const newComment = {
      text: submissionData.message.trim(),
      timestamp: new Date().toISOString(),
      author: commentingUser?.fullName || "",
      authorId: commentingUser?.id || "",
      fileUrl: submissionData.attachments[0],
    };
    try {
      if (!task || !task._id) return;
      const response = await updateTask(task._id, {
        ...task,
        comments: [...((task?.comments || []) as any[]), newComment],
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? response : t)));
    } catch (e) {
      console.error("Failed to submit comment", e);
    } finally {
      setIsLoading(false);
      // ensure scroll after state update completes
      setTimeout(() => {
        bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 0);
    }
  };

  const handleDeleteComment = async (tId: string, cId: string) => {
    const result = await deleteTodoTaskComment(tId, cId);
    if (result.message === "Comment deleted successfully") {
      setTasks((prev) =>
        prev.map((tk) =>
          tk._id !== tId
            ? tk
            : { ...tk, comments: tk.comments.filter((c: any) => c._id !== cId) }
        )
      );
      setTimeout(() => {
        bottomAnchorRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      }, 0);
    }
  };

  const handleStatusChange = async (value: TaskStatus) => {
    if (!task?._id) return;
    // if (value === "COMPLETED" && userRole !== "master") return;
    //  const oldTask = task;
    const nextTask = { ...task, status: value };
    setTasks((prev) => prev.map((t) => (t._id === task._id ? nextTask : t)));
    setIsLoading(true);
    try {
      await updateTask(task._id, { ...task, status: value });
      
    } finally {
      setIsLoading(false);
      // setTasks((prev) => prev.map((t) => (t._id === oldTask._id ? oldTask : t)));
    }
  };

  if (!task) return null;
  // console.log("task", task)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        ref={containerRef}
        className="relative z-10 flex h-full w-full max-w-[1600px] min-h-0 flex-col overflow-hidden rounded-lg bg-white shadow-xl md:h-[96%] md:w-[96%]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header (compact) */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white/90 px-3 py-2 backdrop-blur">
          {/* <Badge variant="outline" className={`px-1.5 py-0.5 text-[10px] ${statusColors[task.status]}`}>
            {task.status}
          </Badge> */}
          <Select
            value={task.status}
            onValueChange={(v) => handleStatusChange(v as TaskStatus)}
          >
            <SelectTrigger
              id="status-inline"
              className="h-7 w-[140px] text-[12px] px-2"
              aria-label="Change status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="text-[12px]">
              {statuses.map((s) => (
                <SelectItem
                  key={s.label}
                  value={s.label}
                // disabled={s.label === "COMPLETED" && userRole !== "master"}
                >
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isOverdue && (
            <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] border-red-300 bg-red-50 text-red-900">
              Overdue
            </Badge>
          )}

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold md:text-sm" title={task.name}>
              {task.name}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              {task.company?.name && <CompanyBadge name={task.company.name} />}
              {task.project?.name && <span className="truncate">• {task.project.name}</span>}
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:border hover:border-red-500" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile segmented control */}
        <div className="flex gap-1 p-2 md:hidden">
          <button
            onClick={() => setMobileTab("details")}
            className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium ${mobileTab === "details" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"
              }`}
          >
            Details
          </button>
          <button
            onClick={() => setMobileTab("comments")}
            className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium ${mobileTab === "comments" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700"
              }`}
          >
            Comments ({task.comments?.length || 0})
          </button>
        </div>

        {/* Desktop split-view (resizable) */}
        <div
          className="hidden h-full min-h-0 md:grid"
          style={{ gridTemplateColumns: `${leftWidth}px 6px 1fr` } as React.CSSProperties}
        >
          {/* Left: Details */}
          <div className="h-full min-h-0 overflow-y-auto px-4 py-3">
            {/* Key/Value grid - ultra compact */}
            <div className="grid grid-cols-[92px_1fr] items-start gap-x-2 gap-y-1 text-[12px]">
              <span className="font-medium">Title</span>
              <div className="truncate" title={task.name}>
                {task.name}
              </div>

              <span className="font-medium">Priority</span>
              <div className="flex items-center gap-1">
                <Flag className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`} fill="currentColor" />
                <span>{task.priority}</span>
              </div>

              <span className="font-medium">Status</span>
              <div>{task.status}</div>

              <span className="font-medium">Due</span>
              <div>{task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "—"}</div>

              <span className="font-medium">Created At</span>
              {task.createdAt
                ? format(new Date(task.createdAt), "dd MMM yyyy, HH:mm")   // 24h
                : "—"}

              <span className="font-medium">Created By</span>
              <div>{task.userId ? createdUser?.fullName : "N/A"}</div>

              {task.company && (
                <>
                  <span className="font-medium">Company</span>
                  <CompanyBadge name={task.company.name} />
                </>
              )}

              {task.project && (
                <>
                  <span className="font-medium">Project</span>
                  <div className="truncate">{task.project.name}</div>
                </>
              )}

              {task.assignees?.length > 0 && (
                <>
                  <span className="font-medium">Assignees</span>
                  <AssigneeGroup names={task.assignees} />
                </>
              )}
            </div>

            {/* Description (collapsible & compact) */}
            <Separator className="my-3" />
            <div className="text-[12px]">
              <div className="mb-1 font-medium">Description</div>
              <div className={`relative rounded-md bg-gray-50 p-2 ${descExpanded ? "max-h-none" : "max-h-56 overflow-hidden"}`}>
                <RichTextViewer content={task.description || ""} />
                {!descExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50" />
                )}
              </div>
              <button
                className="mt-1 text-[11px] font-medium text-gray-600 underline"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            </div>
          </div>

          {/* Resize handle */}
          <div
            className={`relative h-full cursor-col-resize bg-transparent hover:bg-gray-200 ${resizing ? "bg-gray-200" : ""}`}
            onMouseDown={() => setResizing(true)}
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 left-1/2 -ml-[1px] w-[2px] bg-gray-300" />
          </div>

          {/* Right: Comments */}
          <div className="flex h-full min-h-0 flex-col">
            <div className="sticky top-0 z-10 border-b bg-white px-4 py-2">
              <h4 className="text-sm font-semibold">Comments</h4>
            </div>

            {/* SCROLL REGION */}
            <div ref={commentsScrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
              {task.comments?.length ? (
                <div className="space-y-3">
                  {task.comments.map((comment: any, index: number) => (
                    <div key={comment._id || comment.timestamp || index} className="relative rounded-lg border bg-gray-50 p-2">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-[12px] leading-snug">{comment.text}</p>
                          <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-gray-500">
                            <span className="truncate">{comment.author}</span>
                            <span>{format(new Date(comment.timestamp), "PPpp")}</span>
                          </div>
                        </div>

                        {commentingUser?.id === comment.authorId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded p-1 hover:bg-gray-200">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem
                                onClick={() => {
                                  if (task._id && comment._id) {
                                    handleDeleteComment(task._id, comment._id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {comment.fileUrl && (
                        <div className="mt-2 overflow-hidden rounded border">
                          <iframe
                            src={typeof comment.fileUrl === "string" ? comment.fileUrl : URL.createObjectURL(comment.fileUrl)}
                            className="h-56 w-full"
                            title={`Attachment ${index}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={bottomAnchorRef} />
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p className="text-sm">No comments yet</p>
                  <p className="text-[12px]">Be the first to add a comment</p>
                </div>
              )}
            </div>

            {/* Composer (sticky bottom) */}
            <div className="sticky bottom-0 z-10 border-t bg-white px-3 py-2">
              <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
            </div>
          </div>
        </div>

        {/* Mobile panes */}
        <div className="md:hidden">
          {mobileTab === "details" ? (
            <div className="h-[calc(100vh-140px)] overflow-y-auto px-3 pb-4">
              <div className="grid grid-cols-[92px_1fr] items-start gap-x-2 gap-y-1 text-[12px]">
                <span className="font-medium">Title</span>
                <div className="truncate" title={task.name}>
                  {task.name}
                </div>

                <span className="font-medium">Priority</span>
                <div className="flex items-center gap-1">
                  <Flag className={`h-3.5 w-3.5 ${priorityColors[task.priority]}`} fill="currentColor" />
                  <span>{task.priority}</span>
                </div>

                <span className="font-medium">Status</span>
                <div>{task.status}</div>

                <span className="font-medium">Due</span>
                <div>{task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "—"}</div>

                <span className="font-medium">Created At</span>
                <div>{task.createdAt ? format(new Date(task.createdAt), "dd MMM yyyy") : "—"}</div>

                <span className="font-medium">Created By</span>
                <div>{task.userId ? createdUser?.fullName : "N/A"}</div>

                {task.company && (
                  <>
                    <span className="font-medium">Company</span>
                    <CompanyBadge name={task.company.name} />
                  </>
                )}

                {task.project && (
                  <>
                    <span className="font-medium">Project</span>
                    <div className="truncate">{task.project.name}</div>
                  </>
                )}

                {task.assignees?.length > 0 && (
                  <>
                    <span className="font-medium">Assignees</span>
                    <AssigneeGroup names={task.assignees} />
                  </>
                )}
              </div>

              <Separator className="my-3" />
              <div className="text-[12px]">
                <div className="mb-1 font-medium">Description</div>
                <div className={`relative rounded-md bg-gray-50 p-2 ${descExpanded ? "max-h-none" : "max-h-56 overflow-hidden"}`}>
                  <RichTextViewer content={task.description || ""} />
                  {!descExpanded && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50" />
                  )}
                </div>
                <button
                  className="mt-1 text-[11px] font-medium text-gray-600 underline"
                  onClick={() => setDescExpanded((v) => !v)}
                >
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-[calc(100vh-140px)] flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
                {task.comments?.length ? (
                  <div className="space-y-3">
                    {task.comments.map((comment: any, index: number) => (
                      <div key={comment._id || comment.timestamp || index} className="rounded-lg border bg-gray-50 p-2">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="break-words text-[12px] leading-snug">{comment.text}</p>
                            <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-gray-500">
                              <span className="truncate">{comment.author}</span>
                              <span>{format(new Date(comment.timestamp), "PPpp")}</span>
                            </div>
                          </div>
                          {commentingUser?.id === comment.authorId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded p-1 hover:bg-gray-200">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (task._id && comment._id) {
                                      deleteTodoTaskComment(task._id, comment._id).then((result) => {
                                        if (result.message === "Comment deleted successfully") {
                                          setTasks((prev) =>
                                            prev.map((tk) =>
                                              tk._id !== task._id
                                                ? tk
                                                : {
                                                  ...tk,
                                                  comments: tk.comments.filter((c: any) => c._id !== comment._id),
                                                }
                                            )
                                          );
                                        }
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {comment.fileUrl && (
                          <div className="mt-2 overflow-hidden rounded border">
                            <iframe
                              src={typeof comment.fileUrl === "string" ? comment.fileUrl : URL.createObjectURL(comment.fileUrl)}
                              className="h-48 w-full"
                              title={`Attachment ${index}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 z-10 border-t bg-white px-2 py-2">
                <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPopup;
