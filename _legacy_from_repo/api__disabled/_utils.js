export async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function requireCustomer(req) {
  const customerId = req.headers["x-customer-id"];
  if (!customerId) return null;
  return customerId;
}

export function extractQuery(reqUrl) {
  const url = new URL(reqUrl, "http://localhost");
  return url.searchParams;
}

export function pathParam(req, name) {
  const url = new URL(req.url, "http://localhost");
  const segments = url.pathname.split("/").filter(Boolean);
  const idx = segments.indexOf(name === "orderId" ? "orders" : name) + 1;
  return segments[idx];
}
