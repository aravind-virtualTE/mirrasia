import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  SupportTicketNotification,
  listSupportTicketNotifications,
  markSupportTicketNotificationsRead,
} from "@/services/supportTickets";

const POLL_INTERVAL_MS = 30_000;

const SupportTicketNotificationBell = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<SupportTicketNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listSupportTicketNotifications({
        page: 1,
        limit: 20,
      });
      setNotifications(result.data || []);
      setUnreadCount(result.meta?.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsReadAndOpen = async (notification: SupportTicketNotification) => {
    try {
      await markSupportTicketNotificationsRead({ ids: [notification._id] });
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      // no-op
    } finally {
      navigate(`/support/tickets/${notification.ticketId}`);
    }
  };

  const markAll = async () => {
    try {
      const result = await markSupportTicketNotificationsRead({ markAll: true });
      setUnreadCount(result.unreadCount || 0);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      // no-op
    }
  };

  const sortedNotifications = useMemo(
    () =>
      notifications
        .slice()
        .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [notifications]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="text-sm font-semibold">Support Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 text-xs" onClick={markAll}>
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[320px] overflow-auto">
          {!loading && sortedNotifications.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No notifications yet.</div>
          )}
          {sortedNotifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              className={`w-full border-b p-3 text-left hover:bg-muted/30 ${
                notification.read ? "opacity-70" : "bg-muted/20"
              }`}
              onClick={() => markAsReadAndOpen(notification)}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{notification.ticketNumber}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SupportTicketNotificationBell;
