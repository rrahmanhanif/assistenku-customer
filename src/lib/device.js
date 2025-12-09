// src/lib/device.js
export function generateDeviceId() {
  const raw = [
    navigator.userAgent,
    navigator.platform,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    Math.random().toString(36).substring(2),
    Date.now()
  ].join("|");

  return sha256(raw);
}

// SHA-256 hashing
async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map(x => x.toString(16).padStart(2, "0"))
    .join("");
}
