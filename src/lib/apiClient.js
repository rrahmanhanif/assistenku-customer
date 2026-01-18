import { endpoints } from "../services/http/endpoints";
import { httpClient } from "../services/http/httpClient";

export const api = {
  me: () => httpClient.get(endpoints.customer.me),

  listServices: () => httpClient.get(endpoints.services.list),

  estimateOrder: (payload) => httpClient.post(endpoints.orders.estimate, payload),

  createOrder: (payload) => httpClient.post(endpoints.orders.create, payload),

  listOrders: (scope) =>
    httpClient.get(`${endpoints.orders.list}${scope ? `?scope=${scope}` : ""}`),

  getOrderDetail: (id) => httpClient.get(endpoints.orders.detail(id)),

  cancelOrder: (id) => httpClient.post(endpoints.orders.cancel(id)),

  decideEvidence: (id, payload) =>
    httpClient.post(endpoints.orders.evidenceDecision(id), payload),

  createPayment: (id, payload) =>
    httpClient.post(endpoints.orders.paymentCreate(id), payload),

  submitPaymentProof: (id, payload) =>
    httpClient.post(endpoints.orders.paymentProof(id), payload),

  listPayments: () => httpClient.get(endpoints.payments.list),

  createDispute: (payload) =>
    httpClient.post(endpoints.disputes.create, payload),

  listChat: (orderId) =>
    httpClient.get(`${endpoints.chat.list}?order_id=${orderId}`),

  sendChat: (payload) => httpClient.post(endpoints.chat.send, payload),
};
