import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  SupportAssignee,
  SupportTicket,
  TicketSeverity,
  TicketStatus,
  deleteSupportTicket,
  listSupportAssignees,
  listSupportTickets,
  updateSupportTicket,
} from "@/services/supportTickets";

type DraftMap = Record<
  string,
  {
    status: TicketStatus;
    severity: TicketSeverity;
    assigneeId: string;
    resolutionSummary: string;
    fixReference: string;
  }
>;

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const toDraft = (ticket: SupportTicket) => ({
  status: ticket.status,
  severity: ticket.severity,
  assigneeId: ticket.assigneeId || "",
  resolutionSummary: ticket.resolutionSummary || "",
  fixReference: ticket.fixReference || "",
});

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;
  return message || fallback;
};

const SupportTicketQueuePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isInternal = ["admin", "master"].includes(String(user?.role || ""));
  const [loading, setLoading] = useState(false);
  const [savingTicketId, setSavingTicketId] = useState("");
  const [deletingTicketId, setDeletingTicketId] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [assignees, setAssignees] = useState<SupportAssignee[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [severityFilter, setSeverityFilter] = useState<TicketSeverity | "">("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadAssignees = useCallback(async () => {
    try {
      const users = await listSupportAssignees();
      setAssignees(users);
    } catch {
      setAssignees([]);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listSupportTickets({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        assigneeId: assigneeFilter || undefined,
        sort: "-updatedAt",
      });
      setTickets(result.data || []);
      setPages(result.meta?.pages || 1);
      setTotal(result.meta?.total || 0);
      setDrafts((prev) => {
        const next: DraftMap = { ...prev };
        (result.data || []).forEach((ticket) => {
          next[ticket._id] = next[ticket._id] || toDraft(ticket);
        });
        return next;
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.queue.errorDescription", "Failed to load support queue.")
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [assigneeFilter, page, search, severityFilter, statusFilter, t]);

  useEffect(() => {
    if (!isInternal) return;
    loadAssignees();
  }, [isInternal, loadAssignees]);

  useEffect(() => {
    if (!isInternal) return;
    loadTickets();
  }, [isInternal, loadTickets]);

  const saveTicket = async (ticketId: string) => {
    const draft = drafts[ticketId];
    if (!draft) return;

    try {
      setSavingTicketId(ticketId);
      await updateSupportTicket(ticketId, {
        status: draft.status,
        severity: draft.severity,
        assigneeId: draft.assigneeId,
        resolutionSummary: draft.resolutionSummary,
        fixReference: draft.fixReference,
      });
      await loadTickets();
      toast({
        title: t("supportTickets.queue.saveSuccessTitle", "Queue item updated"),
        description: t(
          "supportTickets.queue.saveSuccessDescription",
          "Ticket assignment/status/resolution has been updated."
        ),
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.queue.saveErrorDescription", "Failed to update queue item.")
        ),
        variant: "destructive",
      });
    } finally {
      setSavingTicketId("");
    }
  };

  const removeTicket = async (ticketId: string) => {
    const confirmed = window.confirm(
      t(
        "supportTickets.queue.deleteConfirm",
        "Delete this support ticket and all linked S3 attachments?"
      )
    );
    if (!confirmed) return;

    try {
      setDeletingTicketId(ticketId);
      await deleteSupportTicket(ticketId);
      setTickets((prev) => prev.filter((ticket) => ticket._id !== ticketId));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      toast({
        title: t("supportTickets.queue.deleteSuccessTitle", "Ticket deleted"),
        description: t(
          "supportTickets.queue.deleteSuccessDescription",
          "Ticket record and attachment files were deleted."
        ),
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.queue.deleteErrorDescription", "Failed to delete ticket.")
        ),
        variant: "destructive",
      });
    } finally {
      setDeletingTicketId("");
    }
  };

  if (!isInternal) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {t("supportTickets.queue.forbidden", "You are not allowed to access support queue.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("supportTickets.queue.title", "Support Queue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("supportTickets.queue.searchPlaceholder", "Search tickets")}
            />
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "")}
            >
              <option value="">{t("supportTickets.list.allStatuses", "All statuses")}</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as TicketSeverity | "")}
            >
              <option value="">
                {t("supportTickets.queue.allSeverities", "All severities")}
              </option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">{t("supportTickets.queue.allAssignees", "All assignees")}</option>
              {assignees.map((assignee) => (
                <option key={assignee._id} value={assignee._id}>
                  {assignee.fullName}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                loadTickets();
              }}
            >
              {t("supportTickets.list.applyFilters", "Apply")}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("supportTickets.queue.total", {
              defaultValue: "Total queued tickets: {{count}}",
              count: total,
            })}
          </p>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            {t("supportTickets.common.loading", "Loading...")}
          </CardContent>
        </Card>
      )}

      {!loading && tickets.length === 0 && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            {t("supportTickets.queue.empty", "No tickets in queue for current filters.")}
          </CardContent>
        </Card>
      )}

      {tickets.map((ticket) => {
        const draft = drafts[ticket._id] || toDraft(ticket);
        return (
          <Card key={ticket._id}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  {ticket.ticketNumber} - {ticket.title}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticket.reporterName} ({ticket.reporterEmail})
                </p>
              </div>
              <Badge variant="outline" className={statusStyles[ticket.status]}>
                {ticket.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {ticket.description}
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>{t("supportTickets.fields.status", "Status")}</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.status}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [ticket._id]: {
                          ...draft,
                          status: e.target.value as TicketStatus,
                        },
                      }))
                    }
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("supportTickets.fields.severity", "Severity")}</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.severity}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [ticket._id]: {
                          ...draft,
                          severity: e.target.value as TicketSeverity,
                        },
                      }))
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("supportTickets.fields.assignee", "Assignee")}</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={draft.assigneeId}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [ticket._id]: {
                          ...draft,
                          assigneeId: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="">{t("supportTickets.detail.unassigned", "Unassigned")}</option>
                    {assignees.map((assignee) => (
                      <option key={assignee._id} value={assignee._id}>
                        {assignee.fullName} ({assignee.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("supportTickets.fields.resolutionSummary", "Resolution Summary")}</Label>
                <Textarea
                  value={draft.resolutionSummary}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [ticket._id]: {
                        ...draft,
                        resolutionSummary: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("supportTickets.fields.fixReference", "Fix Reference")}</Label>
                <Input
                  value={draft.fixReference}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [ticket._id]: {
                        ...draft,
                        fixReference: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="outline" onClick={() => navigate(`/support/tickets/${ticket._id}`)}>
                  {t("supportTickets.queue.openDetail", "Open Detail")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => removeTicket(ticket._id)}
                  disabled={deletingTicketId === ticket._id}
                >
                  {deletingTicketId === ticket._id
                    ? t("supportTickets.detail.deleting", "Deleting...")
                    : t("supportTickets.detail.delete", "Delete Ticket")}
                </Button>
                <Button
                  onClick={() => saveTicket(ticket._id)}
                  disabled={savingTicketId === ticket._id}
                >
                  {savingTicketId === ticket._id
                    ? t("supportTickets.common.saving", "Saving...")
                    : t("supportTickets.queue.save", "Save Queue Update")}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm text-muted-foreground">
            {t("supportTickets.list.pageInfo", {
              defaultValue: "Page {{page}} of {{pages}}",
              page,
              pages,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              {t("supportTickets.list.prev", "Previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
            >
              {t("supportTickets.list.next", "Next")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketQueuePage;
