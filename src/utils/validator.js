// src/utils/validator.js
// ===========================================
// UNIVERSAL VALIDATOR — ADMIN, MITRA, CUSTOMER
// Versi Stabil & Aman XSS, Regex, Normalize
// ===========================================

// Normalisasi input agar lebih aman
export function normalize(text = "") {
  return String(text)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "") // anti XSS injection
    .normalize("NFKC");
}

// ==========================
// VALIDASI EMAIL
// ==========================
export function validateEmail(email) {
  if (!email) return false;
  email = normalize(email);

  // Regex email standar industri
  const regex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  return regex.test(email);
}

// ==========================
// VALIDASI PASSWORD
// ==========================
// Minimal 6 karakter, aman untuk Firebase + Supabase
export function validatePassword(password) {
  if (!password) return false;
  return String(password).length >= 6;
}

// ==========================
// VALIDASI NAMA (Customer, Mitra)
// ==========================
export function validateName(name) {
  if (!name) return false;
  name = normalize(name);

  return (
    name.length >= 2 &&
    /^[A-Za-zÀ-ž\s'.-]+$/.test(name)
  );
}

// ==========================
// VALIDASI NOMOR HP
// Format Indonesia: 08xxxxxxxxxx
// ==========================
export function validatePhone(phone) {
  if (!phone) return false;
  phone = normalize(phone);

  // Bisa 08xxxx atau +628xxxx
  return (
    /^08[0-9]{8,12}$/.test(phone) ||
    /^\+628[0-9]{8,12}$/.test(phone)
  );
}

// ==========================
// VALIDASI OTP (4–6 digit)
// ==========================
export function validateOTP(code) {
  if (!code) return false;

  return /^[0-9]{4,6}$/.test(code);
}

// ==========================
// VALIDASI TEKS (chat, input bebas)
// Aman — anti XSS
// ==========================
export function validateText(text) {
  if (!text) return false;

  text = normalize(text);

  // minimal 1 karakter nyata
  return text.length > 0;
}

// ==========================
// EXPORT DEFAULT
// ==========================
export default {
  normalize,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateOTP,
  validateText,
};
