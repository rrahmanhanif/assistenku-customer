export function logError(error, location = "unknown") {
  fetch("https://assistenku-core.vercel.app/api/log-error", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: error?.message || "No message",
      stack: error?.stack || null,
      location,
      time: new Date().toISOString(),
    }),
  }).catch(() => {});
}
