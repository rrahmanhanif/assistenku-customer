const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function withAuthHeaders(options = {}) {
  const headers = new Headers(options.headers || {});
  const customerId = localStorage.getItem("customer_id");
  if (customerId) headers.set("x-customer-id", customerId);

  const token = localStorage.getItem("customer_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  return { ...options, headers };
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, await withAuthHeaders());
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(
    `${API_BASE_URL}${path}`,
    await withAuthHeaders({
      method: "POST",
      body: JSON.stringify(body || {}),
    })
  );
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
