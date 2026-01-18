import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export async function getServices() {
  const baseUrl = import.meta.env.VITE_ADMIN_URL;
  const res = await httpClient.get(endpoints.admin.servicesList, { baseUrl });

  if (!res?.success) return [];

  return res.services || [];
}
