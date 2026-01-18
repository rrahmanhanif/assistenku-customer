import { httpClient } from "../services/http/httpClient";

export async function apiGet(endpoint, options) {
  return httpClient.get(endpoint, options);
}

export async function apiPost(endpoint, body, options) {
  return httpClient.post(endpoint, body, options);
}
