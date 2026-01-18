import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export function logError(error, location = "unknown") {
  httpClient
    .post(endpoints.core.logError, {
      message: error?.message || "No message",
      stack: error?.stack || null,
      location,
      time: new Date().toISOString(),
    })
    .catch(() => {});
}
