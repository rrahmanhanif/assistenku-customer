export const endpoints = {
  auth: {
    whoami: "/api/auth/whoami",
  },

  client: {
    invoicesList: "/api/client/invoices/list",
  },

  config: {
    services: "/api/config/services",
    pricing: "/api/config/pricing",
  },

  customer: {
    me: "/api/customer/me",
  },

  services: {
    list: "/api/services/list",
  },

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
    paymentProof: (id: string) =>
      `/api/orders/${id}/payment/proof`,
  },

  disputes: {
    list: "/api/disputes/list",
    create: "/api/disputes/create",
  },

  invoices: {
    list: "/api/invoices/list",
    markPaidRequest: "/api/invoices/mark-paid-request",
  },

  payments: {
    list: "/api/payments/list",
  },

  chat: {
    list: "/api/chat/list",
    send: "/api/chat/send",
  },

  core: {
    logError: "https://assistenku-core.vercel.app/api/log-error",
  },

  admin: {
    servicesList: "/api/services/list",
  },
};
