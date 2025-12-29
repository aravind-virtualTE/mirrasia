import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { reqAtom } from "./rfq";
import { deleteReqForEnquiry, getRedQuoteData, updateReqForEnquiry } from "./rfq";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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
  vaspInterest?: string;
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
  // hour: "2-digit",
  // minute: "2-digit",
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
    personTitle: e.personTitle ?? "",
    snsType: e.snsType ?? "",
    snsId: e.snsId ?? "",
    countriesOther: e.countriesOther ?? "",
    industriesOther: e.industriesOther ?? "",
    servicesOther: e.servicesOther ?? "",
    materialsOther: e.materialsOther ?? "",
    productDescription: e.productDescription ?? "",
    vaspInterest: e.vaspInterest ?? "",
    structure: e.structure ?? "",
    structureOther: e.structureOther ?? "",
  };
}

const joinWithOther = (values?: string[], other?: string) => {
  const list = [...(values || [])];
  if (other && other.trim() !== "") list.push(other.trim());
  return list;
};

const renderBadges = (values?: string[], other?: string) => {
  const list = joinWithOther(values, other);
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

// ---------------- Component ----------------
export type SortKey = "personName" | "email" | "createdAt" | "vaspInterest" | "structure";

export default function ReqForEnquiryList() {
  const [atomList, setListState] = useAtom(reqAtom);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "createdAt",
    dir: "desc",
  });
  const compact = false as const;

  // Detail dialog state (view -> edit -> save)
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ReqForEnquiry | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState<ReqForEnquiry | null>(null);
  const [saving, setSaving] = useState(false);

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

  // ----- Detail dialog handlers -----
  const openDetails = (row: ReqForEnquiry) => {
    const normalized = normalizeReq(row);
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

      // optimistic update (local)
      setListState((prev) =>
        (prev || []).map((e: ReqForEnquiry) =>
          e._id === selected._id ? { ...e, ...form, updatedAt: new Date().toISOString() } : e
        )
      );

      // API call: keep your current signature
      await updateReqForEnquiry(form);

      const updatedSelected: ReqForEnquiry = { ...selected, ...form, updatedAt: new Date().toISOString() };
      setSelected(updatedSelected);
      setForm({ ...updatedSelected });
      setIsEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete handlers -----
  const requestDelete = (id?: string) => {
    setDeletingId(id ?? "");
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setListState((prev) => (prev || []).filter((e: ReqForEnquiry) => e._id !== deletingId));
    await deleteReqForEnquiry(deletingId);

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
        <h2 className="mb-3 text-lg font-semibold">Quotation Request list</h2>

        <ScrollArea className="w-full rounded-xl border">
          <Table className={cn("text-sm", compact && "text-[13px]")}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>No</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("personName")}>
                    Name
                    <SortIcon active={sort.key === "personName"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("email")}>
                    Email
                    <SortIcon active={sort.key === "email"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead>Phone</TableHead>
                <TableHead>SNS</TableHead>
                <TableHead>Industries</TableHead>
                <TableHead>Services</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("vaspInterest")}>
                    VASP
                    <SortIcon active={sort.key === "vaspInterest"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("structure")}>
                    Structure
                    <SortIcon active={sort.key === "structure"} dir={sort.dir} />
                  </button>
                </TableHead>

                <TableHead className="max-w-[300px]">Product description</TableHead>

                <TableHead className="whitespace-nowrap py-2 px-3">
                  <button className="inline-flex items-center text-left font-semibold" onClick={() => onToggleSort("createdAt")}>
                    Created
                    <SortIcon active={sort.key === "createdAt"} dir={sort.dir} />
                  </button>
                </TableHead>

                {/* Keep column for spacing/alignment, but no per-row edit icon needed */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((row, idx) => {
                const created = asDate(row.createdAt);
                return (
                  <TableRow
                    key={row._id || row.email + row.personName}
                    className={cn("hover:bg-muted/40 cursor-pointer", "focus-within:bg-muted/40")}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetails(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") openDetails(row);
                    }}
                    aria-label={`Open quotation request details for ${row.personName || row.email || "row"}`}
                  >
                    <TableCell className="font-medium">{idx + 1}</TableCell>

                    <TableCell className="font-medium">
                      {row.personName || "—"}
                      {row.personTitle ? <span className="ml-1 text-xs text-muted-foreground">({row.personTitle})</span> : null}
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

                    <TableCell className="max-w-[220px]">{renderBadges(row.industries, row.industriesOther)}</TableCell>
                    <TableCell className="max-w-[220px]">{renderBadges(row.services, row.servicesOther)}</TableCell>

                    <TableCell className="text-muted-foreground">{row.vaspInterest || "—"}</TableCell>

                    <TableCell className="max-w-[180px] text-muted-foreground">
                      {row.structureOther ? `${row.structure || ""} (${row.structureOther})`.trim() : row.structure || "—"}
                    </TableCell>

                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-muted-foreground">{row.productDescription || "—"}</p>
                    </TableCell>

                    <TableCell className="text-muted-foreground">{created ? dt.format(created) : "—"}</TableCell>

                    {/* Action is minimal; primary actions live in dialog */}
                    <TableCell className="text-right" onClick={stopRowClick}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => requestDelete(row._id as string)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="py-6 text-center text-muted-foreground">
                    No records.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Detail Dialog (View -> Edit -> Save) */}
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
              <DialogTitle className="flex items-start justify-between gap-3">
                <span>Quotation request details</span>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Created: {asDate(selected?.createdAt) ? dt.format(asDate(selected?.createdAt)!) : "—"}</div>                  
                </div>
              </DialogTitle>             
            </DialogHeader>
          </div>

          {/* Body (scroll) */}
          <div className="px-6 py-5 overflow-auto max-h-[calc(88vh-160px)]">
            {form && (
              <div className="grid gap-6">
                {/* Contact */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-semibold mb-3">Contact</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="personName">Name</Label>
                      <Input
                        id="personName"
                        value={form.personName}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, personName: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="personTitle">Title</Label>
                      <Input
                        id="personTitle"
                        value={form.personTitle || ""}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, personTitle: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="personPhone">Phone</Label>
                      <Input
                        id="personPhone"
                        value={form.personPhone || ""}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, personPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* SNS */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-semibold mb-3">SNS</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="snsType">SNS Type</Label>
                      <Input
                        id="snsType"
                        value={form.snsType || ""}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, snsType: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="snsId">SNS ID</Label>
                      <Input
                        id="snsId"
                        value={form.snsId || ""}
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, snsId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Interests & Scope */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-semibold mb-3">Scope</div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="vaspInterest">VASP interest</Label>
                      <select
                        id="vaspInterest"
                        className={cn(
                          "h-9 w-full rounded-md border bg-background px-3 text-sm shadow-sm",
                          !isEditMode && "opacity-70 pointer-events-none"
                        )}
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
                        disabled={!isEditMode}
                        onChange={(e) => setForm({ ...form, structure: e.target.value })}
                      />
                      {form.structureOther ? (
                        <div className="text-xs text-muted-foreground">Other: {form.structureOther}</div>
                      ) : null}
                    </div>
                  </div>

                  {/* Readable tag sections (view-first UX); keep edit mode simple */}
                  <div className="mt-5 grid gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Countries</div>
                      {renderBadges(form.countries, form.countriesOther)}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Industries</div>
                      {renderBadges(form.industries, form.industriesOther)}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Services</div>
                      {renderBadges(form.services, form.servicesOther)}
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Materials</div>
                      {renderBadges(form.materials, form.materialsOther)}
                    </div>
                  </div>
                </div>

                {/* Product description */}
                <div className="rounded-xl border p-4">
                  <div className="text-sm font-semibold mb-3">Product description</div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="productDescription">Description</Label>
                    <Textarea
                      id="productDescription"
                      value={form.productDescription || ""}
                      disabled={!isEditMode}
                      onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                      className="min-h-[160px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer (actions always visible) */}
          <div className="border-t bg-background px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
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
