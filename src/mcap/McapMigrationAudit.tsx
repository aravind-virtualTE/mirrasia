/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Download } from "lucide-react";

type MigrationError = {
  legacyId?: string;
  message?: string;
};

type MigrationSampleParty = {
  name?: string;
  email?: string;
  type?: string;
  roles?: string[];
  shares?: number;
  invited?: boolean;
};

type MigrationSample = {
  companyId?: string;
  countryCode?: string;
  companyName?: string;
  applicantEmail?: string;
  stepIdx?: number;
  paymentStatus?: string;
  incorporationStatus?: string;
  partiesFromLegacyDoc?: number;
  partiesFromShareholderLinks?: number;
  linkRowsUnresolved?: number;
  dedupedLinkedParties?: number;
  finalParties?: number;
  parties?: MigrationSampleParty[];
};

type UnresolvedLinkedRow = {
  linkId?: string;
  shrDirId?: string;
  email?: string;
  name?: string;
  reason?: string;
  dataFilled?: boolean;
};

type UnresolvedLinkedCompany = {
  companyId?: string;
  companyName?: string;
  unresolvedCount?: number;
  rows?: UnresolvedLinkedRow[];
};

type MigrationReport = {
  auditId?: string | null;
  preview: boolean;
  force: boolean;
  totalLegacy: number;
  migrated: number;
  created: number;
  updated: number;
  skippedExisting: number;
  failed: number;
  partiesFromLegacyDoc?: number;
  partiesFromShareholderLinks?: number;
  linkRows?: number;
  linkRowsWithShrDirId?: number;
  linkRowsResolved?: number;
  linkRowsUnresolved?: number;
  dedupedLinkedParties?: number;
  finalParties?: number;
  unresolvedLinkedByCompany?: UnresolvedLinkedCompany[];
  errors: MigrationError[];
  sample: MigrationSample[];
};

type MigrationAuditItem = {
  _id: string;
  mode: "preview" | "run";
  force: boolean;
  startedAt?: string;
  finishedAt?: string;
  startedByEmail?: string;
  success?: boolean;
  errorMessage?: string;
  result?: MigrationReport;
  createdAt?: string;
};

type MigrationTarget = "HK" | "US" | "SG" | "PA" | "PPIF" | "COMMON";

const MIGRATION_TARGET_META: Record<MigrationTarget, { label: string; sourceModel: string }> = {
  HK: { label: "Hong Kong", sourceModel: "hkincorporation" },
  US: { label: "United States", sourceModel: "usIncorporation" },
  SG: { label: "Singapore", sourceModel: "sgIncorporation" },
  PA: { label: "Panama", sourceModel: "paIncorporation" },
  PPIF: { label: "Panama Foundation", sourceModel: "PanamaFoundation" },
  COMMON: { label: "Common Countries", sourceModel: "commonCountries" },
};

const fmtDateTime = (value?: string) => {
  if (!value) return "N/A";
  const dt = new Date(value);
  if (Number.isNaN(+dt)) return value;
  return `${dt.toISOString().slice(0, 10)} ${dt.toISOString().slice(11, 19)} UTC`;
};

const downloadJson = (name: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export default function McapMigrationAudit() {
  const [targetCountry, setTargetCountry] = useState<MigrationTarget>("HK");
  const [commonCountryCodes, setCommonCountryCodes] = useState("");
  const [legacyId, setLegacyId] = useState("");
  const [limit, setLimit] = useState("");
  const [force, setForce] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [latestReport, setLatestReport] = useState<MigrationReport | null>(null);
  const [history, setHistory] = useState<MigrationAuditItem[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [selectedUnresolvedCompanyId, setSelectedUnresolvedCompanyId] = useState<string>("");
  const reportSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedAudit = useMemo(
    () => history.find((item) => item._id === selectedAuditId) || null,
    [history, selectedAuditId]
  );
  const migrationSlug = targetCountry.toLowerCase();
  const targetLabel = MIGRATION_TARGET_META[targetCountry].label;
  const sourceModelLabel = MIGRATION_TARGET_META[targetCountry].sourceModel;

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await api.get(`/mcap/migrations/${migrationSlug}-legacy/reports`, {
        params: { page: 1, limit: 50 },
      });
      const items: MigrationAuditItem[] = res?.data?.data?.items || [];
      setHistory(items);
      setSelectedAuditId((prev) => {
        if (prev && items.some((item) => item._id === prev)) return prev;
        return items.length > 0 ? items[0]._id : null;
      });
      if (items.length === 0) setLatestReport(null);
    } catch (err: any) {
      toast({
        title: "Failed to load history",
        description: err?.response?.data?.message || err?.message || "Unable to load migration reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [migrationSlug]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setSelectedAuditId(null);
    setHistory([]);
    setLatestReport(null);
    setSelectedUnresolvedCompanyId("");
    if (targetCountry !== "COMMON") {
      setCommonCountryCodes("");
    }
  }, [targetCountry]);

  useEffect(() => {
    if (selectedAudit?.result) {
      setLatestReport(selectedAudit.result);
    }
  }, [selectedAudit]);

  const runMigration = async (previewMode: boolean) => {
    if (!previewMode) {
      const ok = window.confirm(
        `Execute live ${targetCountry} migration now? This will write into UnifiedCompany and UnifiedParty.`
      );
      if (!ok) return;
    }

    const params = new URLSearchParams();
    params.set("preview", previewMode ? "true" : "false");
    if (force) params.set("force", "true");
    if (legacyId.trim()) params.set("id", legacyId.trim());
    if (targetCountry === "COMMON" && commonCountryCodes.trim()) {
      params.set("countryCode", commonCountryCodes.trim());
    }
    const parsedLimit = Number(limit);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      params.set("limit", String(Math.floor(parsedLimit)));
    }

    try {
      setIsRunning(true);
      const res = await api.post(`/mcap/migrations/${migrationSlug}-legacy?${params.toString()}`);
      const report: MigrationReport = res?.data?.data;
      setLatestReport(report || null);
      if (report?.auditId) {
        setSelectedAuditId(String(report.auditId));
      }

      toast({
        title: previewMode ? `${targetCountry} preview completed` : `${targetCountry} migration completed`,
        description: `Processed: ${report?.migrated || 0}, Failed: ${report?.failed || 0}`,
      });

      await fetchHistory();
    } catch (err: any) {
      toast({
        title: previewMode ? `${targetCountry} preview failed` : `${targetCountry} migration failed`,
        description: err?.response?.data?.message || err?.message || "Unexpected error.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const reportToShow = latestReport || selectedAudit?.result || null;
  const unresolvedCompanies = useMemo(
    () => (Array.isArray(reportToShow?.unresolvedLinkedByCompany) ? reportToShow.unresolvedLinkedByCompany : []),
    [reportToShow]
  );
  const selectedUnresolvedCompany = useMemo(
    () =>
      unresolvedCompanies.find((entry) => String(entry.companyId || "") === String(selectedUnresolvedCompanyId || "")) ||
      unresolvedCompanies[0] ||
      null,
    [unresolvedCompanies, selectedUnresolvedCompanyId]
  );

  useEffect(() => {
    if (unresolvedCompanies.length === 0) {
      setSelectedUnresolvedCompanyId("");
      return;
    }
    setSelectedUnresolvedCompanyId((prev) => {
      if (prev && unresolvedCompanies.some((entry) => String(entry.companyId || "") === String(prev))) return prev;
      return String(unresolvedCompanies[0].companyId || "");
    });
  }, [unresolvedCompanies]);

  return (
    <div className="max-width mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MCAP Legacy Migration</CardTitle>
          <CardDescription>
            Trigger and monitor legacy {targetLabel} migration (`{sourceModelLabel}` to MCAP unified models) and keep audit reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label htmlFor="targetCountry">Migration Target</Label>
              <Select
                value={targetCountry}
                onValueChange={(value) => setTargetCountry(value as MigrationTarget)}
                disabled={isRunning || isLoadingHistory}
              >
                <SelectTrigger id="targetCountry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HK">Hong Kong</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                  <SelectItem value="PA">Panama</SelectItem>
                  <SelectItem value="PPIF">Panama Foundation</SelectItem>
                  <SelectItem value="COMMON">Common Countries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {targetCountry === "COMMON" ? (
              <div className="space-y-1">
                <Label htmlFor="commonCountryCodes">Country Code(s) (optional)</Label>
                <Input
                  id="commonCountryCodes"
                  value={commonCountryCodes}
                  onChange={(e) => setCommonCountryCodes(e.target.value.toUpperCase())}
                  placeholder="AE,BZ,BVI,KY,CW,EE,MH,MT,CH,VC,SC,GB,CN-SZ,CR"
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <Label htmlFor="legacyId">Legacy ID (optional)</Label>
              <Input
                id="legacyId"
                value={legacyId}
                onChange={(e) => setLegacyId(e.target.value)}
                placeholder="Mongo ObjectId"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="limit">Limit (optional)</Label>
              <Input
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-1">
              <Label>Options</Label>
              <label className="flex items-center gap-2 h-10">
                <Checkbox checked={force} onCheckedChange={(v) => setForce(v === true)} />
                <span className="text-sm">Force update existing migrated records</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runMigration(true)} disabled={isRunning}>
              {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Run Preview
            </Button>
            <Button onClick={() => runMigration(false)} disabled={isRunning} variant="destructive">
              {isRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Execute Migration
            </Button>
            <Button onClick={fetchHistory} disabled={isLoadingHistory} variant="outline">
              {isLoadingHistory ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Audit History
            </Button>
            {reportToShow ? (
              <Button
                onClick={() =>
                  downloadJson(
                    `mcap-${migrationSlug}-migration-report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
                    reportToShow
                  )
                }
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {reportToShow ? (
        <div ref={reportSectionRef}>
        <Card>
          <CardHeader>
            <CardTitle>Current Report</CardTitle>
            <CardDescription>
              {targetLabel}: {reportToShow.preview ? "Preview mode" : "Execution mode"} {reportToShow.force ? "• force enabled" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              <Badge variant="secondary">Total: {reportToShow.totalLegacy}</Badge>
              <Badge variant="secondary">Migrated: {reportToShow.migrated}</Badge>
              <Badge variant="secondary">Created: {reportToShow.created}</Badge>
              <Badge variant="secondary">Updated: {reportToShow.updated}</Badge>
              <Badge variant="secondary">Skipped: {reportToShow.skippedExisting}</Badge>
              <Badge variant={reportToShow.failed > 0 ? "destructive" : "secondary"}>Failed: {reportToShow.failed}</Badge>
              <Badge variant="outline">Preview: {String(reportToShow.preview)}</Badge>
              <Badge variant="outline">Force: {String(reportToShow.force)}</Badge>
              <Badge variant="secondary">Legacy Parties: {reportToShow.partiesFromLegacyDoc ?? 0}</Badge>
              <Badge variant="secondary">Linked Parties: {reportToShow.partiesFromShareholderLinks ?? 0}</Badge>
              <Badge variant="secondary">Linked Resolved: {reportToShow.linkRowsResolved ?? 0}</Badge>
              <Badge variant={Number(reportToShow.linkRowsUnresolved || 0) > 0 ? "destructive" : "secondary"}>
                Linked Unresolved: {reportToShow.linkRowsUnresolved ?? 0}
              </Badge>
              <Badge variant="secondary">Deduped Linked: {reportToShow.dedupedLinkedParties ?? 0}</Badge>
              <Badge variant="secondary">Final Parties: {reportToShow.finalParties ?? 0}</Badge>
            </div>

            {Array.isArray(reportToShow.errors) && reportToShow.errors.length > 0 ? (
              <div className="space-y-2">
                <div className="font-medium text-sm">Errors</div>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Legacy ID</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportToShow.errors.map((err, idx) => (
                        <TableRow key={`${err.legacyId || "err"}-${idx}`}>
                          <TableCell className="font-mono text-xs">{err.legacyId || "N/A"}</TableCell>
                          <TableCell>{err.message || "Unknown error"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}

            {unresolvedCompanies.length > 0 ? (
              <div className="space-y-2">
                <div className="font-medium text-sm">Unresolved Linked Parties (Per Company)</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company ID</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Unresolved</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unresolvedCompanies.map((entry, idx) => {
                          const companyKey = String(entry.companyId || `unknown-${idx}`);
                          const isSelected = companyKey === String(selectedUnresolvedCompany?.companyId || "");
                          return (
                            <TableRow key={companyKey}>
                              <TableCell className="font-mono text-xs">{entry.companyId || "N/A"}</TableCell>
                              <TableCell>{entry.companyName || "N/A"}</TableCell>
                              <TableCell>{entry.unresolvedCount ?? entry.rows?.length ?? 0}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "secondary" : "outline"}
                                  onClick={() => setSelectedUnresolvedCompanyId(companyKey)}
                                >
                                  View Rows
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="rounded border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>shrDirId</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Link ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!selectedUnresolvedCompany || !Array.isArray(selectedUnresolvedCompany.rows) || selectedUnresolvedCompany.rows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No unresolved linked rows.
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedUnresolvedCompany.rows.map((row, idx) => (
                            <TableRow key={`${row.linkId || "row"}-${idx}`}>
                              <TableCell className="font-mono text-xs">{row.shrDirId || "N/A"}</TableCell>
                              <TableCell>{row.email || "N/A"}</TableCell>
                              <TableCell>{row.name || "N/A"}</TableCell>
                              <TableCell>{row.reason || "N/A"}</TableCell>
                              <TableCell className="font-mono text-xs">{row.linkId || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : null}

            {Array.isArray(reportToShow.sample) && reportToShow.sample.length > 0 ? (
              <div className="space-y-2">
                <div className="font-medium text-sm">Sample Mappings</div>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Legacy ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Applicant Email</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Legacy</TableHead>
                        <TableHead>Linked</TableHead>
                        <TableHead>Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportToShow.sample.map((sample, idx) => (
                        <TableRow key={`${sample.companyId || "sample"}-${idx}`}>
                          <TableCell className="font-mono text-xs">{sample.companyId || "N/A"}</TableCell>
                          <TableCell>{sample.companyName || "N/A"}</TableCell>
                          <TableCell>{sample.applicantEmail || "N/A"}</TableCell>
                          <TableCell>{sample.stepIdx ?? 0}</TableCell>
                          <TableCell>{sample.paymentStatus || "N/A"}</TableCell>
                          <TableCell>{sample.partiesFromLegacyDoc ?? 0}</TableCell>
                          <TableCell>
                            {(sample.partiesFromShareholderLinks ?? 0)}
                            {(sample.linkRowsUnresolved ?? 0) > 0 ? ` (${sample.linkRowsUnresolved} unresolved)` : ""}
                          </TableCell>
                          <TableCell>{sample.finalParties ?? sample.parties?.length ?? 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
          <CardDescription>Persisted server-side migration runs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Force</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Migrated</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No migration history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow
                      key={item._id}
                      className={item._id === selectedAuditId ? "bg-muted/40" : ""}
                    >
                      <TableCell className="text-xs">{fmtDateTime(item.startedAt || item.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.mode}</Badge>
                      </TableCell>
                      <TableCell>{String(item.force)}</TableCell>
                      <TableCell>
                        <Badge variant={item.success ? "secondary" : "destructive"}>
                          {item.success ? "success" : "failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.result?.migrated ?? 0}</TableCell>
                      <TableCell>{item.result?.failed ?? 0}</TableCell>
                      <TableCell>{item.startedByEmail || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAuditId(item._id);
                              if (item.result) {
                                setLatestReport(item.result);
                                window.setTimeout(() => {
                                  reportSectionRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }, 0);
                              } else {
                                toast({
                                  title: "No report snapshot",
                                  description: "This audit row has no stored result payload yet.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              downloadJson(
                                `mcap-${migrationSlug}-migration-audit-${item._id}.json`,
                                item
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
