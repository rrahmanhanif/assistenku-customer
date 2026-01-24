// src/services/http/endpoints.js
export const endpoints = {
  auth: {
    whoami: "/api/auth/whoami",
  },

  admin: {
    ledgerOverview: "/api/admin/ledger/overview",
    services: "/assistenku/admin/services",
    pricing: "/assistenku/admin/pricing",
    orders: "/assistenku/admin/orders",
    ledger: "/assistenku/admin/ledger",
    audit: "/assistenku/admin/audit",
    mitra: "/assistenku/admin/mitra",
    verifyMitra: "/assistenku/admin/verify-mitra",
    payouts: "/api/admin/payouts",
  },

  partner: {
    list: "/partners",
  },

  customer: {
    list: "/customers",
  },

  monitoring: {
    partnersStatus: "/partners/status",
    customersStatus: "/customers/status",
  },

  withdraw: {
    list: "/api/withdraw/list",
  },

  core: {
    logError: "https://assistenku-core.vercel.app/api/log-error",
  },

  flip: {
    disbursement: "https://bigflip.id/api/v2/disbursement",
  },
};
