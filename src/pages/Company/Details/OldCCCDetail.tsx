/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Save,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { cccCompanyData, Company } from "@/pages/CurrentClient/cccState";
import MemoApp from "./MemosHK";
import AdminProject from "@/pages/dashboard/Admin/Projects/AdminProject";
import TodoApp from "@/pages/Todo/TodoApp";
import ChecklistHistory from "@/pages/Checklist/ChecklistHistory";
import { fetchUsers, updateCurrentClient } from "@/services/dataFetch";
import { User } from "@/components/userList/UsersList";
import { toast } from "@/hooks/use-toast";

/** ---------- Small local helpers to match the “above styling” ---------- */
function LabelValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Initials(name?: string) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return letters.toUpperCase() || name[0]?.toUpperCase() || "•";
}

function FallbackAvatar({ name }: { name?: string }) {
  return (
    <Avatar className="h-6 w-6">
      <AvatarFallback className="text-[10px]">{Initials(name)}</AvatarFallback>
    </Avatar>
  );
}

const OldCCCDetail: React.FC<{ id: string }> = ({ id }) => {
  const [customers] = useAtom(cccCompanyData);
  const [comp, SetCompany] = useState<Company | undefined>(
    customers.find((c) => c._id === id)
  );
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [adminAssigned, setAdminAssigned] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  useEffect(() => {
    (async () => {
      setAdminAssigned("");
      const response = await fetchUsers();
      const filteredUsers = response.filter(
        (e: { role: string }) => e.role === "admin" || e.role === "master"
      );
      setUsers(filteredUsers);
    })();
  }, []);

  const AssignAdmin = () => {
    const handleAssign = (value: string) => setAdminAssigned(value);
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Assign Admin</span>
        <div className="w-60">
          {/* Kept Select UI but read-only feel — if you want true read-only, remove this block */}
          <select
            value={adminAssigned}
            onChange={(e) => handleAssign(e.target.value)}
            className="h-8 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="" disabled>
              Assign Admin to...
            </option>
            {users.map((u) => (
              <option key={u._id} value={u.fullName || ""}>
                {u.fullName || u.email}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const updated = await updateCurrentClient(comp);
      if (updated) {
        SetCompany(updated);
        toast({
          title: "Company details updated",
          description: "The company information has been saved successfully.",
        });
      } else {
        toast({
          title: "Save failed",
          description: "There was an error updating the company information.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const percent = (part?: number, total?: number) =>
    part && total ? `${((Number(part) / Number(total)) * 100).toFixed(2)}%` : "—";

  return (
    <Tabs defaultValue="details" className="flex w-full flex-col">
      <TabsList className="flex w-full rounded-t-lg border-b bg-background/80 p-1">
        <TabsTrigger
          value="details"
          className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Company Details
        </TabsTrigger>
        <TabsTrigger
          value="service-agreement"
          className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Record of Documents
        </TabsTrigger>
        {user?.role !== "user" && (
          <TabsTrigger
            value="Memos"
            className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Memo
          </TabsTrigger>
        )}
        {user?.role !== "user" && (
          <TabsTrigger
            value="Projects"
            className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Project
          </TabsTrigger>
        )}
        <TabsTrigger
          value="Checklist"
          className="flex-1 rounded-md py-3 text-md font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
        >
          Checklist
        </TabsTrigger>
      </TabsList>

      {/* DETAILS TAB */}
      <TabsContent value="details" className="p-4 lg:p-6">
        {/* Header actions (Todo + Assign + Docs) */}
        {user?.role !== "user" && comp?.companyNameEng && (
          <div className="mb-4">
            <TodoApp id={id} name={comp.companyNameEng} />
          </div>
        )}
        <div className="flex items-center gap-x-8">
          {user?.role !== "user" && <AssignAdmin />}
          <Button
            onClick={() => navigate(`/company-documents/ccp/${id}`)}
            size="sm"
            className="flex items-center gap-2"
          >
            Company Docs
          </Button>
        </div>

        <div className="mx-auto max-width p-2 pb-24">
          {/* SINGLE LEFT CARD (read-only) */}
          <div className="grid gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-xl">
                          {comp?.companyNameEng || comp?.companyNameChi || "Untitled Company"}
                        </CardTitle>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="text-muted-foreground">
                            {comp?.jurisdiction || "—"}
                          </Badge>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Badge variant="outline">{comp?.status || "Pending"}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5">
                {/* Basic info (read-only) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabelValue label="Company Name (EN)">{comp?.companyNameEng || "—"}</LabelValue>
                  <LabelValue label="Company Name (ZH)">{comp?.companyNameChi || "—"}</LabelValue>

                  <LabelValue label="Company Type">{comp?.companyType || "—"}</LabelValue>
                  <LabelValue label="BRN Number">{comp?.brnNo || "—"}</LabelValue>

                  <LabelValue label="Incorporation Date">{comp?.incorporationDate || "—"}</LabelValue>
                  <LabelValue label="Bank">{comp?.bank || "—"}</LabelValue>

                  <LabelValue label="Total Shares">{comp?.noOfShares ?? "—"}</LabelValue>
                  <LabelValue label="Share Capital">{comp?.shareCapital || "—"}</LabelValue>
                </div>

                <Separator />

                {/* Jurisdiction */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LabelValue label="Jurisdiction">{comp?.jurisdiction || "—"}</LabelValue>
                </div>

                <Separator />

                {/* Designated contact */}
                <div className="grid gap-3">
                  <div className="text-xs text-muted-foreground">Designated Contact</div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <LabelValue label="Name">{comp?.designatedContact?.[0]?.name || "—"}</LabelValue>
                    <LabelValue label="Email">{comp?.designatedContact?.[0]?.email || "—"}</LabelValue>
                    <LabelValue label="Phone">{comp?.designatedContact?.[0]?.phone || "—"}</LabelValue>
                  </div>
                </div>

                <Separator />

                {/* Directors */}
                <div className="grid gap-3">
                  <div className="text-xs text-muted-foreground">Directors</div>
                  <div className="grid gap-3">
                    {comp?.directors?.length ? (
                      comp.directors.map((d, idx) => (
                        <div key={`director-${idx}`} className="rounded-md border p-3">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <LabelValue label="Name">
                              <div className="flex items-center gap-2">
                                <FallbackAvatar name={d?.name} />
                                <span className="text-sm">{d?.name || "—"}</span>
                              </div>
                            </LabelValue>
                            <LabelValue label="Email">{d?.email || "—"}</LabelValue>
                            <LabelValue label="Phone">{d?.phone || "—"}</LabelValue>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No directors added.</div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Shareholders */}
                <div className="grid gap-3">
                  <div className="text-xs text-muted-foreground">Shareholders</div>
                  <div className="grid gap-3">
                    {comp?.shareholders?.length ? (
                      comp.shareholders.map((s, idx) => (
                        <div key={`shareholder-${idx}`} className="rounded-md border p-3">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                            <LabelValue label="Name">{s?.name || "—"}</LabelValue>
                            <LabelValue label="Email">{s?.email || "—"}</LabelValue>
                            <LabelValue label="Total Shares">{s?.totalShares ?? "—"}</LabelValue>
                            <LabelValue label="Percentage">
                              {percent(s?.totalShares, comp?.noOfShares)}
                            </LabelValue>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No shareholders added.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky save bar (kept for consistency with above view) */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-width items-center justify-between gap-3 p-3">
              <div className="text-xs text-muted-foreground">
                Status: <strong>{comp?.status || "Pending"}</strong>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpdate}>
                  <Save className="mr-1 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* OTHER TABS (unchanged) */}
      <TabsContent value="service-agreement" className="p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Service Agreement Details</h1>
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">—</CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="Memos" className="p-6">
        <div className="space-y-6">
          <MemoApp id={id} />
        </div>
      </TabsContent>

      <TabsContent value="Projects" className="p-6">
        <div className="space-y-6">
          <AdminProject id={id} />
        </div>
      </TabsContent>

      <TabsContent value="Checklist" className="p-6">
        <ChecklistHistory id={id} items={[[], []]} />
      </TabsContent>
    </Tabs>
  );
};

export default OldCCCDetail;
