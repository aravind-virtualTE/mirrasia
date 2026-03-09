import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  TicketCategory,
  TicketSeverity,
  createSupportTicket,
} from "@/services/supportTickets";

const CATEGORY_OPTIONS: TicketCategory[] = [
  "BUG",
  "UI_UX",
  "PERFORMANCE",
  "DATA",
  "SECURITY",
  "FEATURE_REQUEST",
  "OTHER",
];

const SEVERITY_OPTIONS: TicketSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message;
  return message || fallback;
};

const SupportTicketCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "BUG" as TicketCategory,
    severity: "MEDIUM" as TicketSeverity,
    pageUrl: "",
    browser: "",
    os: "",
    device: "",
    // appVersion: "",
  });

  const canSubmit = useMemo(
    () => form.title.trim().length >= 3 && form.description.trim().length >= 5,
    [form.title, form.description]
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      const result = await createSupportTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        environment: {
          pageUrl: form.pageUrl,
          browser: form.browser,
          os: form.os,
          device: form.device,
          // appVersion: form.appVersion,
        },
        attachments,
      });

      toast({
        title: t("supportTickets.create.successTitle", "Ticket created"),
        description: t(
          "supportTickets.create.successDescription",
          "Your issue has been submitted to the support queue."
        ),
      });

      navigate(`/support/tickets/${result.data._id}`);
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.create.errorDescription", "Failed to create ticket.")
        ),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("supportTickets.create.title", "Report an Issue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="ticket-title">
                  {t("supportTickets.fields.title", "Title")}
                </Label>
                <Input
                  id="ticket-title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder={t(
                    "supportTickets.create.titlePlaceholder",
                    "Short summary of the issue"
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-category">
                  {t("supportTickets.fields.category", "Category")}
                </Label>
                <select
                  id="ticket-category"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as TicketCategory,
                    }))
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-severity">
                  {t("supportTickets.fields.severity", "Severity")}
                </Label>
                <select
                  id="ticket-severity"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={form.severity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      severity: e.target.value as TicketSeverity,
                    }))
                  }
                >
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="ticket-description">
                  {t("supportTickets.fields.description", "Description")}
                </Label>
                <Textarea
                  id="ticket-description"
                  className="min-h-[160px]"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={t(
                    "supportTickets.create.descriptionPlaceholder",
                    "Explain steps, expected result, and actual result."
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-page-url">
                  {t("supportTickets.fields.pageUrl", "Page URL")}
                </Label>
                <Input
                  id="ticket-page-url"
                  value={form.pageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, pageUrl: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-browser">
                  {t("supportTickets.fields.browser", "Browser")}
                </Label>
                <Input
                  id="ticket-browser"
                  value={form.browser}
                  onChange={(e) => setForm((prev) => ({ ...prev, browser: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-os">{t("supportTickets.fields.os", "OS")}</Label>
                <Input
                  id="ticket-os"
                  value={form.os}
                  onChange={(e) => setForm((prev) => ({ ...prev, os: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-device">
                  {t("supportTickets.fields.device", "Device")}
                </Label>
                <Input
                  id="ticket-device"
                  value={form.device}
                  onChange={(e) => setForm((prev) => ({ ...prev, device: e.target.value }))}
                />
              </div>

              {/* <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="ticket-app-version">
                  {t("supportTickets.fields.appVersion", "App Version")}
                </Label>
                <Input
                  id="ticket-app-version"
                  value={form.appVersion}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, appVersion: e.target.value }))
                  }
                />
              </div> */}

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="ticket-attachments">
                  {t("supportTickets.fields.attachments", "Attachments")}
                </Label>
                <Input
                  id="ticket-attachments"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments(files.slice(0, 5));
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {t(
                    "supportTickets.create.attachmentsHint",
                    "Up to 5 files, max 10MB each. Allowed: png, jpg, webp, pdf, txt, json, zip."
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate("/support/tickets")}>
                {t("supportTickets.common.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting
                  ? t("supportTickets.common.submitting", "Submitting...")
                  : t("supportTickets.create.submit", "Submit Ticket")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketCreatePage;
