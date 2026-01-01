export function formatCurrency(amount) {
  return `Rp${Number(amount || 0).toLocaleString()}`;
}

export function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
