import { API_BASE_URL } from "./baseUrl";
import { getToken } from "./getToken";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  endpoint: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  baseUrl?: string;
  signal?: AbortSignal;
};

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => null);
  }
  const text = await res.text();
  return text ? { message: text } : null;
}

function buildHeaders(options: RequestOptions) {
  const headers = new Headers(options.headers || {});

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const customerId = localStorage.getItem("customer_id");
  if (customerId && !headers.has("x-customer-id")) {
    headers.set("x-customer-id", customerId);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const endpoint = options.endpoint.startsWith("http")
    ? options.endpoint
    : `${baseUrl}${options.endpoint}`;

  const res = await fetch(endpoint, {
    method: options.method ?? "GET",
    headers: buildHeaders(options),
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.detail)) ||
      `Request failed: ${res.status}`;
    throw new HttpError(message, res.status, data);
  }

  return data as T;
}

export const httpClient = {
  request,

  get: <T = unknown>(
    endpoint: string,
    options: Omit<RequestOptions, "endpoint"> = {}
  ) => request<T>({ ...options, endpoint, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, "endpoint" | "body"> = {}
  ) => request<T>({ ...options, endpoint, body, method: "POST" }),

  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, "endpoint" | "body"> = {}
  ) => request<T>({ ...options, endpoint, body, method: "PATCH" }),
};
