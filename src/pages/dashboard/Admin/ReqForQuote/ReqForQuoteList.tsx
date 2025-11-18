import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { reqAtom } from "./rfq"; 
import { deleteReqForEnquiry, getRedQuoteData, updateReqForEnquiry } from "./rfq"; // 👈 change names if needed

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
export type ReqForEnquiry = {
  _id?: string;
  email: string;
  personName: string;
  personTitle?: string;
  personPhone?: string;
  userId?: string;
  snsType?: string;
  snsId?: string;
  countries?: string[];
  countriesOther?: string;
  industries?: string[];
  industriesOther?: string;
  services?: string[];
  servicesOther?: string;
  productDescription?: string;
  vaspInterest?: string; // "yes" | "no" | ... if you want to narrow
  structure?: string;
  structureOther?: string;
  materials?: string[];
  materialsOther?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
};

// ---------------- Helpers ----------------
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

function normalizeReq(e: ReqForEnquiry): ReqForEnquiry {
  return {
    countries: [],
    industries: [],
    services: [],
    materials: [],
    ...e,
    personName: e.personName ?? "",
    email: e.email ?? "",
    personPhone: e.personPhone ?? "",
  };
}

// ---------------- Component ----------------
export type SortKey = "personName" | "email" | "createdAt" | "vaspInterest" | "structure";

export default function ReqForEnquiryList() {
  const [atomList, setListState] = useAtom(reqAtom);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });
  const compact = false as const;

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ReqForEnquiry | null>(null);
  const [form, setForm] = useState<ReqForEnquiry | null>(null);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await getRedQuoteData();
      setListState(response?.data || []);
    };
    fetchData();
  }, [setListState]);

  const onToggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const items = useMemo(() => {
    const from = (atomList || []) as ReqForEnquiry[];
    return from.map(normalizeReq);
  }, [atomList]);

  const sorted = useMemo(() => {
    const arr = [...items];
    const { key, dir } = sort;

    arr.sort((a, b) => {
      if (key === "createdAt") {
        const ad = asDate(a.createdAt)?.getTime() ?? 0;
        const bd = asDate(b.createdAt)?.getTime() ?? 0;
        return dir === "asc" ? ad - bd : bd - ad;
      }

      const av = (a?.[key] || "") as string;
      const bv = (b?.[key] || "") as string;
      const comp = collator.compare(av, bv);
      return dir === "asc" ? comp : -comp;
    });

    return arr;
  }, [items, sort]);

  // ----- Edit handlers -----
  const openEdit = (row: ReqForEnquiry) => {
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
    setListState((prev) =>
      (prev || []).map((e: ReqForEnquiry) =>
        e._id === editing._id ? { ...e, ...form, updatedAt: new Date().toISOString() } : e
      )
    );
    await updateReqForEnquiry(form);
    closeEdit();
  };

  // ----- Delete handlers -----
  const openDelete = (id?: string) => {
    setDeletingId(id ?? "");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setListState((prev) => (prev || []).filter((e: ReqForEnquiry) => e._id !== deletingId));
    await deleteReqForEnquiry(deletingId);
    setDeleteOpen(false);
    setDeletingId("");
  };

  const cancelDelete = () => {
    setDeleteOpen(false);
    setDeletingId("");
  };

  const renderTags = (values?: string[], other?: string) => {
    const list = [...(values || [])];
    if (other && other.trim() !== "") list.push(other.trim());
    if (!list.length) return <span className="text-muted-foreground">—</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {list.map((v) => (
          <Badge key={v} variant="outline" className="text-[11px] px-2 py-0.5">
            {v}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={cn("w-full")}>
        <h2 className="mb-3 text-lg font-semibold">Quotation Request list</h2>

        <ScrollArea className="w-full rounded-xl border">
          <Table className={cn("text-sm", compact && "text-[13px]")}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>No</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button
                    className="inline-flex items-center text-left font-semibold"
                    onClick={() => onToggleSort("personName")}
                  >
                    Name
                    <SortIcon active={sort.key === "personName"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button
                    className="inline-flex items-center text-left font-semibold"
                    onClick={() => onToggleSort("email")}
                  >
                    Email
                    <SortIcon active={sort.key === "email"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead>Phone</TableHead>
                <TableHead>SNS</TableHead>
                {/* <TableHead>Countries</TableHead> */}
                <TableHead>Industries</TableHead>
                <TableHead>Services</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button
                    className="inline-flex items-center text-left font-semibold"
                    onClick={() => onToggleSort("vaspInterest")}
                  >
                    VASP
                    <SortIcon active={sort.key === "vaspInterest"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button
                    className="inline-flex items-center text-left font-semibold"
                    onClick={() => onToggleSort("structure")}
                  >
                    Structure
                    <SortIcon active={sort.key === "structure"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="max-w-[300px]">Product description</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button
                    className="inline-flex items-center text-left font-semibold"
                    onClick={() => onToggleSort("createdAt")}
                  >
                    Created
                    <SortIcon active={sort.key === "createdAt"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((row, idx) => {
                const created = asDate(row.createdAt);
                return (
                  <TableRow
                    key={row._id || row.email + row.personName}
                    className="hover:bg-muted/40"
                  >
                    <TableCell className="font-medium">{idx + 1}</TableCell>

                    <TableCell className="font-medium">
                      {row.personName || "—"}
                      {row.personTitle ? (
                        <span className="ml-1 text-xs text-muted-foreground">({row.personTitle})</span>
                      ) : null}
                    </TableCell>

                    <TableCell className="text-muted-foreground">{row.email || "—"}</TableCell>
                    <TableCell>{row.personPhone || "—"}</TableCell>

                    <TableCell className="max-w-[180px] text-muted-foreground">
                      {row.snsType || row.snsId ? (
                        <span>
                          {row.snsType || "—"} {row.snsId ? ` / ${row.snsId}` : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* <TableCell className="max-w-[220px]">
                      {renderTags(row.countries, row.countriesOther)}
                    </TableCell> */}

                    <TableCell className="max-w-[220px]">
                      {renderTags(row.industries, row.industriesOther)}
                    </TableCell>

                    <TableCell className="max-w-[220px]">
                      {renderTags(row.services, row.servicesOther)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {row.vaspInterest || "—"}
                    </TableCell>

                    <TableCell className="max-w-[180px] text-muted-foreground">
                      {row.structureOther
                        ? `${row.structure || ""} (${row.structureOther})`.trim()
                        : row.structure || "—"}
                    </TableCell>

                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-muted-foreground">
                        {row.productDescription || "—"}
                      </p>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {created ? dt.format(created) : "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                        >
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
                  <TableCell colSpan={13} className="py-6 text-center text-muted-foreground">
                    No records.
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
            <DialogTitle>Edit Req For Enquiry</DialogTitle>
            <DialogDescription>Update the details and click Save.</DialogDescription>
          </DialogHeader>

          {form && (
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="personName">Name</Label>
                <Input
                  id="personName"
                  value={form.personName}
                  onChange={(e) => setForm({ ...form, personName: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="personTitle">Title</Label>
                <Input
                  id="personTitle"
                  value={form.personTitle || ""}
                  onChange={(e) => setForm({ ...form, personTitle: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="personPhone">Phone</Label>
                <Input
                  id="personPhone"
                  value={form.personPhone || ""}
                  onChange={(e) => setForm({ ...form, personPhone: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="snsType">SNS Type</Label>
                <Input
                  id="snsType"
                  value={form.snsType || ""}
                  onChange={(e) => setForm({ ...form, snsType: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="snsId">SNS ID</Label>
                <Input
                  id="snsId"
                  value={form.snsId || ""}
                  onChange={(e) => setForm({ ...form, snsId: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="productDescription">Product description</Label>
                <Textarea
                  id="productDescription"
                  value={form.productDescription || ""}
                  onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="vaspInterest">VASP interest</Label>
                  <select
                    id="vaspInterest"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm"
                    value={form.vaspInterest || ""}
                    onChange={(e) => setForm({ ...form, vaspInterest: e.target.value || undefined })}
                  >
                    <option value="">—</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="structure">Structure</Label>
                  <Input
                    id="structure"
                    value={form.structure || ""}
                    onChange={(e) => setForm({ ...form, structure: e.target.value })}
                  />
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
            <AlertDialogTitle>Delete record?</AlertDialogTitle>
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
