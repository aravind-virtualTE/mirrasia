import api from "@/services/fetch";

export interface GoogleIntegrationStatus {
  connected: boolean;
  scopes: string[];
}

export async function getGoogleIntegrationStatus(): Promise<GoogleIntegrationStatus> {
  const res = await api.get("/google-integration/status");
  return res.data;
}

export async function getGoogleConnectUrl(): Promise<string> {
  const res = await api.get("/google-integration/connect");
  return res.data.url;
}

export async function disconnectGoogle(): Promise<void> {
  await api.post("/google-integration/disconnect");
}

export async function addTaskToGoogleTasks(
  taskId: string
): Promise<{ googleTaskId: string }> {
  const res = await api.post(`/google-integration/tasks/${taskId}`);
  return res.data;
}

export async function addTaskToGoogleCalendar(
  taskId: string
): Promise<{ googleCalendarEventId: string }> {
  const res = await api.post(`/google-integration/calendar/${taskId}`);
  return res.data;
}

export async function removeTaskFromGoogleTasks(
  taskId: string
): Promise<void> {
  await api.delete(`/google-integration/tasks/${taskId}`);
}

export async function removeTaskFromGoogleCalendar(
  taskId: string
): Promise<void> {
  await api.delete(`/google-integration/calendar/${taskId}`);
}
