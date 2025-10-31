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
  DialogFooter,
  DialogClose,
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
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
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
  const order: Record<NonNullable<Enquiry["status"]>, number> = { "TO DO": 0, "IN PROGRESS": 1, "IN REVIEW": 2, COMPLETED: 3 };
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

// ---------------- Component (uses enquiryAtom) ----------------
export type SortKey = "name" | "email" | "createdAt" | "priority" | "status";

export default function EnquiryList() {
  const [atomList, setListState] = useAtom(enquiryAtom);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "createdAt", dir: "desc" });
  const compact = false as const;

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [form, setForm] = useState<Enquiry | null>(null);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getEnquiryData();
      setListState(response?.data || []);
    };
    fetchUser();
  }, [setListState]);

  const onToggleSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
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
        const as = statusRank(a.status);
        const bs = statusRank(b.status);
        return dir === "asc" ? as - bs : bs - as;
      }
      const av = (a?.[key] || "") as string;
      const bv = (b?.[key] || "") as string;
      const comp = collator.compare(av, bv);
      return dir === "asc" ? comp : -comp;
    });

    return arr;
  }, [enquiries, sort]);

  // ----- Edit handlers -----
  const openEdit = (row: Enquiry) => {
    setEditing(row);
    setForm({ ...row });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
    setForm(null);
  };

  const saveEdit = async () => {
    if (!form || !editing || !editing._id) return;
    // Local update to atom (replace with API later)
    setListState((prev) =>
      (prev || []).map((e: Enquiry) => (e._id === editing._id ? { ...e, ...form, updatedAt: new Date().toISOString() } : e))
    );
    await updateEnquiry(editing._id, form)
    closeEdit();
  };

  // ----- Delete handlers -----
  const openDelete = (id?: string) => {
    setDeletingId(id ?? '');
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    // Local removal from atom (replace with API later)
    setListState((prev) => (prev || []).filter((e: Enquiry) => e._id !== deletingId));
    await deleteEnquiry(deletingId);
    setDeleteOpen(false);
    setDeletingId('');
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeletingId('');
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
                  <TableRow key={row._id || row.email + row.name} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
                    <TableCell>{row.phone || "—"}</TableCell>
                    <TableCell className="max-w-[320px]">
                      <p className="truncate text-muted-foreground">{row.message || "—"}</p>
                    </TableCell>
                    <TableCell>
                      {row.priority ? (
                        <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", priorityTone[row.priority])}>
                          {row.priority}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.status ? (
                        <Badge variant="outline" className={cn("rounded-full px-2 py-0.5 text-[11px] leading-4", statusTone[row.status])}>
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

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openDelete(row._id as string)}
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => (!o ? closeEdit() : setEditOpen(true))}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit enquiry</DialogTitle>
            <DialogDescription>Update the details and click Save. You can wire this to your API later.</DialogDescription>
          </DialogHeader>

          {form && (
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm"
                    value={form.priority || ""}
                    onChange={(e) => setForm({ ...form, priority: (e.target.value || undefined) as Enquiry["priority"] })}
                  >
                    <option value="">—</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm"
                    value={form.status || ""}
                    onChange={(e) => setForm({ ...form, status: (e.target.value || undefined) as Enquiry["status"] })}
                  >
                    <option value="">—</option>
                    <option value="TO DO">TO DO</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="IN REVIEW">IN REVIEW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={(o) => (!o ? cancelDelete() : setDeleteOpen(true))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. You can replace this with an API call later.</AlertDialogDescription>
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
