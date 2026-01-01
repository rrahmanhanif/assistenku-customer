const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function apiRequest(path, options = {}) {
  const tokenCustomer = localStorage.getItem("customer_id");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    "x-customer-id": tokenCustomer || "",
  };

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  me: () => apiRequest("/customer/me"),
  listServices: () => apiRequest("/services/list"),
  estimateOrder: (payload) =>
    apiRequest("/orders/estimate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createOrder: (payload) =>
    apiRequest("/orders/create", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listOrders: (scope) =>
    apiRequest(`/orders/list${scope ? `?scope=${scope}` : ""}`),
  getOrderDetail: (id) => apiRequest(`/orders/${id}`),
  cancelOrder: (id) => apiRequest(`/orders/${id}/cancel`, { method: "POST" }),
  decideEvidence: (id, payload) =>
    apiRequest(`/orders/${id}/evidence/decision`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createPayment: (id, payload) =>
    apiRequest(`/orders/${id}/payment/create`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitPaymentProof: (id, payload) =>
    apiRequest(`/orders/${id}/payment/proof`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listPayments: () => apiRequest(`/payments/list`),
  createDispute: (payload) =>
    apiRequest(`/disputes/create`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listChat: (orderId) => apiRequest(`/chat/list?order_id=${orderId}`),
  sendChat: (payload) =>
    apiRequest(`/chat/send`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
