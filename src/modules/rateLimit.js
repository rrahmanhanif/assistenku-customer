let lastSentTime = 0;
const MIN_INTERVAL = 1500; // 1.5 detik

export function canSendMessage() {
  const now = Date.now();
  if (now - lastSentTime < MIN_INTERVAL) return false;
  lastSentTime = now;
  return true;
}
