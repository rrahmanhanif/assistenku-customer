export function validateText(text, min = 2, max = 50) {
  if (!text) return false;
  if (typeof text !== "string") return false;
  if (text.length < min || text.length > max) return false;
  return /^[a-zA-Z0-9\s.,'-]+$/.test(text);
}

export function validatePhone(phone) {
  if (!phone) return false;
  return /^(\+62|62|0)[0-9]{9,13}$/.test(phone);
}

export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(pass) {
  if (!pass) return false;
  return pass.length >= 6;
}

export function validateNumber(num) {
  return !isNaN(num) && num !== null && num !== "" && Number(num) >= 0;
}
