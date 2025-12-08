export async function getServices() {
  const endpoint = import.meta.env.VITE_ADMIN_URL + "/api/services/list";

  const req = await fetch(endpoint);
  const res = await req.json();

  if (!res.success) return [];

  return res.services;
}
