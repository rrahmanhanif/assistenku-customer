import { HttpError } from "./httpClient";

type ErrorWithMessage = {
  message?: string;
};

type ErrorDetails = {
  message?: string;
  error?: string;
  detail?: string;
  request_id?: string;
  requestId?: string;
};

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

function extractMessage(error: unknown): string {
  if (!error) return "Terjadi kesalahan.";
  if (typeof error === "string") return error;
  const message = (error as ErrorWithMessage).message;
  if (message) return message;
  return "Terjadi kesalahan.";
}

function extractRequestId(details?: ErrorDetails): string | null {
  return details?.request_id || details?.requestId || null;
}

export function formatApiError(error: unknown): string {
  if (!error) return "Terjadi kesalahan.";

  if (isHttpError(error)) {
    const details = (error.details || {}) as ErrorDetails;
    const requestId = error.requestId || extractRequestId(details);
    const baseMessage =
      details.message || details.error || details.detail || error.message;
    const suffix = `HTTP ${error.status}${
      requestId ? ` · request_id: ${requestId}` : ""
    }`;
    return `${baseMessage} (${suffix})`;
  }

  return extractMessage(error);
}
