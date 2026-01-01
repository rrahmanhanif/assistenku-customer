export function validateOrderPayload(payload) {
  if (!payload.service_id) return "Pilih layanan";
  if (!payload.address_text && !payload.address_id) return "Alamat wajib diisi";
  return null;
}
