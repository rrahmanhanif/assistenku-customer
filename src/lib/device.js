// src/lib/device.js

const OBFUSCATION_SALT =
  import.meta.env.VITE_DEVICE_OBFUSCATION_KEY || "assistenku-device-salt";

/**
 * Generate unique device ID (hashed)
 */
export async function generateDeviceId() {
  const raw = [
    navigator.userAgent,
    navigator.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    Math.random().toString(36).substring(2),
    Date.now(),
  ].join("|");

  return sha256(raw);
}

/**
 * Obfuscate device ID before storing or sending
 */
export function obfuscateDeviceId(deviceId) {
  if (!deviceId) return "";

  const salted = `${deviceId}:${OBFUSCATION_SALT}`;

  try {
    return btoa(encodeURIComponent(salted));
  } catch (err) {
    console.error("Gagal mengaburkan device_id", err);
    return deviceId;
  }
}

/**
 * Reveal original device ID from obfuscated value
 */
export function revealDeviceId(encoded) {
  if (!encoded) return "";

  try {
    const decoded = decodeURIComponent(atob(encoded));
    return decoded.replace(`:${OBFUSCATION_SALT}`, "");
  } catch (err) {
    console.error("Gagal membaca device_id terenkripsi", err);
    return "";
  }
}

/**
 * SHA-256 hashing helper
 */
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);

  return Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
