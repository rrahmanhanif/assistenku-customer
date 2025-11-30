import { canSendMessage } from "../modules/rateLimit";

async function handleSend() {
  if (!canSendMessage()) {
    alert("Terlalu cepat! Tunggu 1–2 detik.");
    return;
  }

  if (!message.trim()) return;

  await onSend(message.trim());
  setMessage("");
}
