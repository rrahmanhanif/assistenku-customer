import { cleanInput } from "../modules/validator";

const safeName = cleanInput(name);
export function cleanInput(str) {
  if (!str) return "";
  return str
    .replace(/<script.*?>.*?<\/script>/gi, "") // hapus script tag
    .replace(/[<>]/g, "") // tidak boleh ada simbol yang bisa jadi HTML
    .trim();
}
