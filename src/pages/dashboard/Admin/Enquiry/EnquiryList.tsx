import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { enquiryAtom } from "./enquiry";
import { deleteEnquiry, getEnquiryData, updateEnquiry } from "@/services/dataFetch";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// ---------------- Types ----------------
export type Comment = {
  author?: string;
  text?: string;
  fileUrl?: string;
  authorId?: string;
  timestamp?: string | Date;
  _id?: string;
};

export type Assignee = {
  id?: string;
  name?: string;
};

export type Enquiry = {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  priority?: "Low" | "Medium" | "High" | "Urgent";
  status?: "TO DO" | "IN PROGRESS" | "IN REVIEW" | "COMPLETED";
  assignees?: Assignee[];
  comments?: Comment[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
};

// ---------------- Helpers ----------------
const priorityTone: Record<NonNullable<Enquiry["priority"]>, string> = {
  Low: "bg-muted text-foreground border",
  Medium:
    "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900",
  High:
    "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900",
  Urgent:
    "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900",
};

const statusTone: Record<NonNullable<Enquiry["status"]>, string> = {
  "TO DO": "bg-muted text-foreground border",
  "IN PROGRESS":
    "bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-900",
  "IN REVIEW":
    "bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-900",
  COMPLETED:
    "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-900",
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />;
  return dir === "asc" ? <ArrowUp className="ml-1 h-3.5 w-3.5" /> : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
}

const collator = new Intl.Collator(undefined, { sensitivity: "base" });
const dt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  // day: "2-digit",
  // hour: "2-digit",
  // minute: "2-digit",
});

function asDate(x?: string | Date) {
  const d = x instanceof Date ? x : x ? new Date(x) : undefined;
  return Number.isFinite(d?.getTime?.()) ? d : undefined;
}

function priorityRank(p?: Enquiry["priority"]) {
  const order: Record<NonNullable<Enquiry["priority"]>, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };
  return p ? order[p] : -1;
}

function statusRank(s?: Enquiry["status"]) {
  const order: Record<NonNullable<Enquiry["status"]>, number> = {
    "TO DO": 0,
    "IN PROGRESS": 1,
    "IN REVIEW": 2,
    COMPLETED: 3,
  };
  return s ? order[s] : -1;
}

function normalizeEnquiry(e: Enquiry): Enquiry {
  return {
    assignees: [],
    comments: [],
    ...e,
    name: e.name ?? "",
    email: e.email ?? "",
    phone: e.phone ?? "",
    message: e.message ?? "",
  };
}

// ---------------- Component ----------------
export type SortKey = "name" | "email" | "createdAt" | "priority" | "status";

export default function EnquiryList() {
  const [atomList, setListState] = useAtom(enquiryAtom);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  const compact = false as const;

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Enquiry | null>(null);

  // Edit mode state (inside dialog)
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<Enquiry | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getEnquiryData();
      setListState(response?.data || []);
    };
    fetchUser();
  }, [setListState]);

  const onToggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const enquiries = useMemo(() => {
    const from = atomList || [];
    return from.map(normalizeEnquiry);
  }, [atomList]);

  const sorted = useMemo(() => {
    const arr = [...enquiries];
    const { key, dir } = sort;

    arr.sort((a, b) => {
      if (key === "createdAt") {
        const ad = asDate(a.createdAt)?.getTime() ?? 0;
        const bd = asDate(b.createdAt)?.getTime() ?? 0;
        return dir === "asc" ? ad - bd : bd - ad;
      }
      if (key === "priority") {
        const ap = priorityRank(a.priority);
        const bp = priorityRank(b.priority);
        return dir === "asc" ? ap - bp : bp - ap;
      }
      if (key === "status") {
        const asr = statusRank(a.status);
        const bsr = statusRank(b.status);
        return dir === "asc" ? asr - bsr : bsr - asr;
      }
      const av = (a?.[key] || "") as string;
      const bv = (b?.[key] || "") as string;
      const comp = collator.compare(av, bv);
      return dir === "asc" ? comp : -comp;
    });

    return arr;
  }, [enquiries, sort]);

  // ---- Dialog open/close ----
  const openDetails = (row: Enquiry) => {
    const normalized = normalizeEnquiry(row);
    setSelected(normalized);
    setForm({ ...normalized });
    setIsEditMode(false);
    setDetailOpen(true);
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setSelected(null);
    setForm(null);
    setIsEditMode(false);
    setSaving(false);
  };

  const enterEditMode = () => {
    if (!selected) return;
    setForm({ ...selected });
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    if (!selected) return;
    setForm({ ...selected });
    setIsEditMode(false);
  };

  const saveEdit = async () => {
    if (!form || !selected || !selected._id) return;
    try {
      setSaving(true);

      // Optimistic update
      setListState((prev) =>
        (prev || []).map((e: Enquiry) =>
          e._id === selected._id ? { ...e, ...form, updatedAt: new Date().toISOString() } : e
        )
      );

      await updateEnquiry(selected._id, form);

      const updatedSelected = { ...selected, ...form, updatedAt: new Date().toISOString() };
      setSelected(updatedSelected);
      setForm({ ...updatedSelected });
      setIsEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete ----
  const requestDelete = (id?: string) => {
    setDeletingId(id ?? "");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setListState((prev) => (prev || []).filter((e: Enquiry) => e._id !== deletingId));
    await deleteEnquiry(deletingId);

    if (selected?._id === deletingId) closeDetails();
    setDeleteOpen(false);
    setDeletingId("");
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeletingId("");
  };

  const stopRowClick: React.MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div className={cn("w-full")}>
        <h2 className="mb-3 text-lg font-semibold">Enquiry list</h2>

        <ScrollArea className="w-full rounded-xl border">
          <Table className={cn("text-sm", compact && "text-[13px]")}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>No</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("name")}>
                    Name
                    <SortIcon active={sort.key === "name"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("email")}>
                    Email
                    <SortIcon active={sort.key === "email"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead>Phone</TableHead>
                <TableHead className="max-w-[320px]">Message</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("priority")}>
                    Priority
                    <SortIcon active={sort.key === "priority"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("status")}>
                    Status
                    <SortIcon active={sort.key === "status"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead>Assignees</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("createdAt")}>
                    Created
                    <SortIcon active={sort.key === "createdAt"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((row, idx) => {
                const created = asDate(row.createdAt);
                return (
                  <TableRow
                    key={row._id || row.email + row.name}
                    className={cn(
                      "hover:bg-muted/40 cursor-pointer",
                      "focus-within:bg-muted/40"
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetails(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openDetails(row);
                    }}
                    aria-label={`Open enquiry details for ${row.name || row.email || "row"}`}
                  >
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
                    <TableCell>{row.phone || "—"}</TableCell>
                    <TableCell className="max-w-[320px]">
                      <p className="truncate text-muted-foreground">{row.message || "—"}</p>
                    </TableCell>

                    <TableCell>
                      {row.priority ? (
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", priorityTone[row.priority])}
                        >
                          {row.priority}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {row.status ? (
                        <Badge
                          variant="outline"
                          className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", statusTone[row.status])}
                        >
                          {row.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-[220px]">
                      {row.assignees && row.assignees.length > 0 ? (
                        <div className="truncate text-muted-foreground">
                          {row.assignees.map((a) => a?.name || a?.id).filter(Boolean).join(", ")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">{created ? dt.format(created) : "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{row.comments?.length ?? 0}</TableCell>

                    {/* Actions (stop propagation so row click doesn't trigger) */}
                    <TableCell className="text-right" onClick={stopRowClick}>
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => requestDelete(row._id as string)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-6 text-center text-muted-foreground">
                    No enquiries.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Detail Dialog (Buttons stay inside, sticky footer) */}
      <Dialog open={detailOpen} onOpenChange={(o) => (!o ? closeDetails() : setDetailOpen(true))}>
        <DialogContent
          className={cn(
            "w-[calc(100vw-24px)] max-w-[calc(100vw-24px)]",
            "sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
            "max-h-[88vh] p-0 overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-3">
                <span>Enquiry details</span>
                {/* Top right quick status chips */}
                <div className="flex items-center gap-2">
                  {form?.priority ? (
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", priorityTone[form.priority])}
                    >
                      {form.priority}
                    </Badge>
                  ) : null}
                  {form?.status ? (
                    <Badge
                      variant="outline"
                      className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", statusTone[form.status])}
                    >
                      {form.status}
                    </Badge>
                  ) : null}
                </div>
              </DialogTitle>

              <DialogDescription className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">                
                <span className="text-xs text-muted-foreground">
                  Created: {asDate(selected?.createdAt) ? dt.format(asDate(selected?.createdAt)!) : "—"}                  
                </span>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body (scroll) */}
          <div className="px-6 py-5 overflow-auto max-h-[calc(88vh-160px)]">
            {form && (
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-name">Name</Label>
                    <Input
                      id="detail-name"
                      value={form.name}
                      disabled={!isEditMode}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-email">Email</Label>
                    <Input
                      id="detail-email"
                      type="email"
                      value={form.email}
                      disabled={!isEditMode}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-phone">Phone</Label>
                    <Input
                      id="detail-phone"
                      value={form.phone}
                      disabled={!isEditMode}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-comments">Comments</Label>
                    <Input id="detail-comments" value={`${selected?.comments?.length ?? 0}`} disabled />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-priority">Priority</Label>
                    <select
                      id="detail-priority"
                      className={cn(
                        "h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm",
                        !isEditMode && "opacity-70 pointer-events-none"
                      )}
                      value={form.priority || ""}
                      onChange={(e) =>
                        setForm({ ...form, priority: (e.target.value || undefined) as Enquiry["priority"] })
                      }
                    >
                      <option value="">—</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="detail-status">Status</Label>
                    <select
                      id="detail-status"
                      className={cn(
                        "h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm",
                        !isEditMode && "opacity-70 pointer-events-none"
                      )}
                      value={form.status || ""}
                      onChange={(e) =>
                        setForm({ ...form, status: (e.target.value || undefined) as Enquiry["status"] })
                      }
                    >
                      <option value="">—</option>
                      <option value="TO DO">TO DO</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="IN REVIEW">IN REVIEW</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="detail-message">Message</Label>
                  <Textarea
                    id="detail-message"
                    value={form.message}
                    disabled={!isEditMode}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="min-h-[140px]"
                  />
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-sm font-medium">Assignees</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selected?.assignees && selected.assignees.length > 0
                      ? selected.assignees.map((a) => a?.name || a?.id).filter(Boolean).join(", ")
                      : "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer (actions always in-scope) */}
          <div className="border-t bg-background px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {/* Delete is in-dialog, not on table column */}
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-950/40"
                onClick={() => requestDelete(selected?._id)}
                disabled={!selected?._id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <Button variant="outline" onClick={closeDetails} disabled={saving}>
                Close
              </Button>

              {!isEditMode ? (
                <Button onClick={enterEditMode} disabled={!selected}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={cancelEditMode} disabled={saving}>
                    Cancel edit
                  </Button>
                  <Button onClick={saveEdit} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => (!o ? cancelDelete() : setDeleteOpen(true))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
