import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  SupportAssignee,
  SupportTicket,
  TicketSeverity,
  TicketStatus,
  addSupportTicketComment,
  deleteSupportTicket,
  getSupportTicketById,
  listSupportAssignees,
  updateSupportTicket,
} from "@/services/supportTickets";

const statusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;
  return message || fallback;
};

const SupportTicketDetailPage = () => {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isInternal = ["admin", "master"].includes(String(user?.role || ""));
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [assignees, setAssignees] = useState<SupportAssignee[]>([]);

  const [commentMessage, setCommentMessage] = useState("");
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [postingComment, setPostingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [savingUpdate, setSavingUpdate] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "OPEN" as TicketStatus,
    severity: "MEDIUM" as TicketSeverity,
    assigneeId: "",
    resolutionSummary: "",
    fixReference: "",
  });

  const loadTicket = async () => {
    try {
      setLoading(true);
      const result = await getSupportTicketById(id);
      setTicket(result.data);
      setUpdateForm({
        status: result.data.status,
        severity: result.data.severity,
        assigneeId: result.data.assigneeId || "",
        resolutionSummary: result.data.resolutionSummary || "",
        fixReference: result.data.fixReference || "",
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.detail.errorDescription", "Failed to load ticket details.")
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadAssignees = async () => {
      if (!isInternal) return;
      try {
        const users = await listSupportAssignees();
        setAssignees(users);
      } catch {
        setAssignees([]);
      }
    };
    loadAssignees();
  }, [isInternal]);

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!commentMessage.trim() && commentFiles.length === 0) return;

    try {
      setPostingComment(true);
      await addSupportTicketComment(id, {
        message: commentMessage.trim(),
        attachments: commentFiles,
      });
      setCommentMessage("");
      setCommentFiles([]);
      await loadTicket();
      toast({
        title: t("supportTickets.comments.successTitle", "Comment added"),
        description: t(
          "supportTickets.comments.successDescription",
          "Your comment has been posted."
        ),
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.comments.errorDescription", "Failed to add comment.")
        ),
        variant: "destructive",
      });
    } finally {
      setPostingComment(false);
    }
  };

  const submitInternalUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticket || !isInternal) return;

    try {
      setSavingUpdate(true);
      await updateSupportTicket(ticket._id, {
        status: updateForm.status,
        severity: updateForm.severity,
        assigneeId: updateForm.assigneeId,
        resolutionSummary: updateForm.resolutionSummary,
        fixReference: updateForm.fixReference,
      });
      await loadTicket();
      toast({
        title: t("supportTickets.detail.updateSuccessTitle", "Ticket updated"),
        description: t(
          "supportTickets.detail.updateSuccessDescription",
          "Ticket fields were updated successfully."
        ),
      });
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.detail.updateErrorDescription", "Failed to update ticket.")
        ),
        variant: "destructive",
      });
    } finally {
      setSavingUpdate(false);
    }
  };

  const onDeleteTicket = async () => {
    if (!isInternal || !ticket) return;
    const confirmed = window.confirm(
      t(
        "supportTickets.detail.deleteConfirm",
        "Delete this support ticket and all linked S3 attachments?"
      )
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteSupportTicket(ticket._id);
      toast({
        title: t("supportTickets.detail.deleteSuccessTitle", "Ticket deleted"),
        description: t(
          "supportTickets.detail.deleteSuccessDescription",
          "Ticket record and attachment files were deleted."
        ),
      });
      navigate("/support/queue");
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.detail.deleteErrorDescription", "Failed to delete ticket.")
        ),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("supportTickets.common.loading", "Loading...")}</p>;
  }

  if (!ticket) {
    return <p className="text-sm text-muted-foreground">{t("supportTickets.detail.notFound", "Ticket not found.")}</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {ticket.ticketNumber} - {ticket.title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("supportTickets.detail.reportedBy", {
                defaultValue: "Reported by {{name}} ({{email}})",
                name: ticket.reporterName,
                email: ticket.reporterEmail,
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusStyles[ticket.status]}>
              {ticket.status}
            </Badge>
            <Badge variant="outline">{ticket.severity}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>

          <div className="grid gap-2 rounded-lg border p-3 text-sm md:grid-cols-2">
            <p>
              <span className="font-medium">{t("supportTickets.fields.category", "Category")}:</span>{" "}
              {ticket.category}
            </p>
            <p>
              <span className="font-medium">{t("supportTickets.fields.assignee", "Assignee")}:</span>{" "}
              {ticket.assigneeName || t("supportTickets.detail.unassigned", "Unassigned")}
            </p>
            <p>
              <span className="font-medium">{t("supportTickets.fields.pageUrl", "Page URL")}:</span>{" "}
              {ticket.environment?.pageUrl || "—"}
            </p>
            <p>
              <span className="font-medium">{t("supportTickets.fields.browser", "Browser")}:</span>{" "}
              {ticket.environment?.browser || "—"}
            </p>
            <p>
              <span className="font-medium">{t("supportTickets.fields.os", "OS")}:</span>{" "}
              {ticket.environment?.os || "—"}
            </p>
            <p>
              <span className="font-medium">{t("supportTickets.fields.device", "Device")}:</span>{" "}
              {ticket.environment?.device || "—"}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">
              {t("supportTickets.fields.attachments", "Attachments")}
            </p>
            {ticket.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("supportTickets.detail.noAttachments", "No attachments.")}
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {ticket.attachments.map((attachment) => (
                  <li key={attachment._id || attachment.url}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {attachment.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isInternal && (
            <form onSubmit={submitInternalUpdate} className="rounded-lg border p-3">
              <p className="mb-3 text-sm font-medium">
                {t("supportTickets.detail.internalActions", "Internal actions")}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("supportTickets.fields.status", "Status")}</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={updateForm.status}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        status: e.target.value as TicketStatus,
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
                    value={updateForm.severity}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        severity: e.target.value as TicketSeverity,
                      }))
                    }
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>{t("supportTickets.fields.assignee", "Assignee")}</Label>
                  <select
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={updateForm.assigneeId}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, assigneeId: e.target.value }))
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
                <div className="space-y-1.5 md:col-span-2">
                  <Label>{t("supportTickets.fields.resolutionSummary", "Resolution Summary")}</Label>
                  <Textarea
                    value={updateForm.resolutionSummary}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        resolutionSummary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>{t("supportTickets.fields.fixReference", "Fix Reference")}</Label>
                  <Input
                    value={updateForm.fixReference}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, fixReference: e.target.value }))
                    }
                    placeholder="PR/commit/reference link"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDeleteTicket}
                  disabled={deleting}
                >
                  {deleting
                    ? t("supportTickets.detail.deleting", "Deleting...")
                    : t("supportTickets.detail.delete", "Delete Ticket")}
                </Button>
                <Button type="submit" disabled={savingUpdate}>
                  {savingUpdate
                    ? t("supportTickets.common.saving", "Saving...")
                    : t("supportTickets.detail.saveChanges", "Save Changes")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("supportTickets.comments.title", "Comments")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ticket.comments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("supportTickets.comments.empty", "No comments yet.")}
            </p>
          )}
          {ticket.comments.map((comment) => (
            <div key={comment._id} className="rounded-lg border p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {comment.authorName || "User"} ({comment.authorRole || "user"})
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{comment.message || "—"}</p>
              {comment.attachments?.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {comment.attachments.map((attachment) => (
                    <li key={attachment._id || attachment.url}>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {attachment.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <form onSubmit={submitComment} className="rounded-lg border p-3">
            <Label htmlFor="new-comment">{t("supportTickets.comments.add", "Add Comment")}</Label>
            <Textarea
              id="new-comment"
              className="mt-1 min-h-[120px]"
              value={commentMessage}
              onChange={(e) => setCommentMessage(e.target.value)}
            />
            <div className="mt-2">
              <Input
                type="file"
                multiple
                onChange={(e) => setCommentFiles(Array.from(e.target.files || []).slice(0, 5))}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="submit" disabled={postingComment}>
                {postingComment
                  ? t("supportTickets.common.submitting", "Submitting...")
                  : t("supportTickets.comments.submit", "Post Comment")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("supportTickets.timeline.title", "Timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("supportTickets.timeline.empty", "No timeline events.")}
            </p>
          )}
          <ul className="space-y-3">
            {ticket.timeline
              .slice()
              .reverse()
              .map((event) => (
                <li key={event._id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.actorName || "System"} ({event.actorRole || "system"}) •{" "}
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketDetailPage;
