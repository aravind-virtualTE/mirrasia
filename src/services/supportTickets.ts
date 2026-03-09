import api from "./fetch";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketCategory =
  | "BUG"
  | "UI_UX"
  | "PERFORMANCE"
  | "DATA"
  | "SECURITY"
  | "FEATURE_REQUEST"
  | "OTHER";

export interface TicketAttachment {
  _id?: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketComment {
  _id?: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  message: string;
  attachments: TicketAttachment[];
  createdAt: string;
}

export interface TicketTimelineEvent {
  _id?: string;
  eventType: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  message: string;
  fromValue?: string;
  toValue?: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  title: string;
  description: string;
  category: TicketCategory;
  severity: TicketSeverity;
  status: TicketStatus;
  environment: {
    pageUrl?: string;
    browser?: string;
    os?: string;
    device?: string;
    appVersion?: string;
  };
  attachments: TicketAttachment[];
  assigneeId?: string;
  assigneeName?: string;
  resolutionSummary?: string;
  fixReference?: string;
  resolvedAt?: string | null;
  resolvedBy?: string;
  comments: TicketComment[];
  timeline: TicketTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketNotification {
  _id: string;
  recipientId: string;
  ticketId: string;
  ticketNumber: string;
  eventType: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SupportAssignee {
  _id: string;
  fullName: string;
  role: string;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    unreadCount?: number;
  };
}

export interface CreateSupportTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  severity: TicketSeverity;
  environment?: {
    pageUrl?: string;
    browser?: string;
    os?: string;
    device?: string;
    appVersion?: string;
  };
  attachments?: File[];
}

export interface UpdateSupportTicketInput {
  status?: TicketStatus;
  severity?: TicketSeverity;
  assigneeId?: string;
  resolutionSummary?: string;
  fixReference?: string;
}

export interface AddSupportTicketCommentInput {
  message?: string;
  attachments?: File[];
}

export interface ListSupportTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  severity?: TicketSeverity;
  category?: TicketCategory;
  assigneeId?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
}

export interface ListSupportNotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

const appendFiles = (formData: FormData, files: File[] = []) => {
  files.forEach((file) => {
    formData.append("attachments", file);
  });
};

export const createSupportTicket = async (input: CreateSupportTicketInput) => {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("category", input.category);
  formData.append("severity", input.severity);
  formData.append("environment", JSON.stringify(input.environment || {}));
  appendFiles(formData, input.attachments || []);

  const response = await api.post<{ data: SupportTicket }>(
    "/support-tickets",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const listSupportTickets = async (query: ListSupportTicketsQuery = {}) => {
  const response = await api.get<PaginatedResponse<SupportTicket>>(
    "/support-tickets",
    { params: query }
  );
  return response.data;
};

export const getSupportTicketById = async (ticketId: string) => {
  const response = await api.get<{ data: SupportTicket }>(
    `/support-tickets/${ticketId}`
  );
  return response.data;
};

export const updateSupportTicket = async (
  ticketId: string,
  update: UpdateSupportTicketInput
) => {
  const response = await api.patch<{ data: SupportTicket }>(
    `/support-tickets/${ticketId}`,
    update
  );
  return response.data;
};

export const deleteSupportTicket = async (ticketId: string) => {
  const response = await api.delete<{ message: string }>(
    `/support-tickets/${ticketId}`
  );
  return response.data;
};

export const addSupportTicketComment = async (
  ticketId: string,
  input: AddSupportTicketCommentInput
) => {
  const formData = new FormData();
  formData.append("message", input.message || "");
  appendFiles(formData, input.attachments || []);

  const response = await api.post<{
    data: TicketComment;
    ticketStatus: TicketStatus;
  }>(`/support-tickets/${ticketId}/comments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const listSupportTicketNotifications = async (
  query: ListSupportNotificationsQuery = {}
) => {
  const response = await api.get<PaginatedResponse<SupportTicketNotification>>(
    "/support-tickets/notifications",
    { params: query }
  );
  return response.data;
};

export const markSupportTicketNotificationsRead = async (payload: {
  ids?: string[];
  markAll?: boolean;
}) => {
  const response = await api.patch<{
    modifiedCount: number;
    unreadCount: number;
  }>("/support-tickets/notifications/read", payload);
  return response.data;
};

export const listSupportAssignees = async () => {
  const response = await api.get<SupportAssignee[]>("/user/getUsers");
  const users = Array.isArray(response.data) ? response.data : [];
  return users.filter((user) => ["admin", "master"].includes(String(user.role)));
};
