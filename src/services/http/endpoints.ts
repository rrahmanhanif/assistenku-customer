export const endpoints = {
  auth: {
    whoami: "/api/auth/whoami",
  },

  /* =========================
     CLIENT (Customer App)
     ========================= */
  client: {
    services: "/api/client/services",
    orders: "/api/client/orders",
    orderDetail: (id: string) => `/api/client/orders/${id}`,
    orderPay: (id: string) => `/api/client/orders/${id}/pay`,
    invoicesList: "/api/client/invoices/list",
  },

  /* =========================
     CONFIG (Legacy / fallback)
     ========================= */
  config: {
    services: "/api/config/services",
    pricing: "/api/config/pricing",
  },

  /* =========================
     CUSTOMER (Identity)
     ========================= */
  customer: {
    me: "/api/customer/me",
  },

  /* =========================
     SERVICES (Public / legacy)
     ========================= */
  services: {
    list: "/api/services/list",
  },

  /* =========================
     ORDERS (Legacy / admin / mitra)
     ========================= */
  orders: {
    list: "/api/orders/list",
    create: "/api/orders/create",
    estimate: "/api/orders/estimate",
    detail: (id: string) => `/api/orders/${id}`,
    cancel: (id: string) => `/api/orders/${id}/cancel`,
    evidenceDecision: (id: string) =>
      `/api/orders/${id}/evidence/decision`,
    paymentCreate: (id: string) =>
      `/api/orders/${id}/payment/create`,
  },
};
