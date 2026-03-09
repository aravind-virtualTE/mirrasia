import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SupportTicket,
  TicketStatus,
  listSupportTickets,
} from "@/services/supportTickets";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

const statusBadgeClass: Record<TicketStatus, string> = {
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

const SupportTicketListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");

  const loadTickets = async () => {
    try {
      setLoading(true);
      const result = await listSupportTickets({
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
        sort: "-updatedAt",
      });
      setTickets(result.data || []);
      setPages(result.meta?.pages || 1);
      setTotal(result.meta?.total || 0);
    } catch (error: unknown) {
      toast({
        title: t("supportTickets.common.error", "Error"),
        description: resolveErrorMessage(
          error,
          t("supportTickets.list.errorDescription", "Failed to load tickets.")
        ),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pageInfo = useMemo(
    () =>
      t("supportTickets.list.pageInfo", {
        defaultValue: "Page {{page}} of {{pages}}",
        page,
        pages,
      }),
    [page, pages, t]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t("supportTickets.list.title", "Issues Tracking")}</CardTitle>
        <Button onClick={() => navigate("/support/tickets/new")}>
          {t("supportTickets.list.newTicket", "Report an Issue")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr,220px,auto]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("supportTickets.list.searchPlaceholder", "Search by id, title, or reporter")}
          />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | "")}
          >
            <option value="">{t("supportTickets.list.allStatuses", "All statuses")}</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
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

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left">{t("supportTickets.fields.ticket", "Ticket")}</th>
                <th className="px-3 py-2 text-left">{t("supportTickets.fields.title", "Title")}</th>
                <th className="px-3 py-2 text-left">{t("supportTickets.fields.status", "Status")}</th>
                <th className="px-3 py-2 text-left">{t("supportTickets.fields.severity", "Severity")}</th>
                <th className="px-3 py-2 text-left">{t("supportTickets.fields.updatedAt", "Updated")}</th>
              </tr>
            </thead>
            <tbody>
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    {t("supportTickets.list.empty", "No tickets found.")}
                  </td>
                </tr>
              )}

              {tickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="cursor-pointer border-t hover:bg-muted/30"
                  onClick={() => navigate(`/support/tickets/${ticket._id}`)}
                >
                  <td className="px-3 py-2 font-medium">{ticket.ticketNumber}</td>
                  <td className="px-3 py-2">{ticket.title}</td>
                  <td className="px-3 py-2">
                    <Badge
                      variant="outline"
                      className={statusBadgeClass[ticket.status as TicketStatus]}
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{ticket.severity}</td>
                  <td className="px-3 py-2">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("supportTickets.list.total", {
              defaultValue: "Total tickets: {{count}}",
              count: total,
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
            <span className="text-sm text-muted-foreground">{pageInfo}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
            >
              {t("supportTickets.list.next", "Next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportTicketListPage;
