// src/app/runtimeLogger.js

const baseMeta = () => ({
  timestamp: new Date().toISOString(),
});

const logWithLevel = (level, message, context = {}) => {
  const payload = {
    level,
    message,
    ...baseMeta(),
    ...context,
  };

  // Structured console logging
  // Can be replaced later with Sentry / remote logging
  const method =
    level === "error" ? "error" : level === "warn" ? "warn" : "log";

  console[method]("[runtime]", payload);
};

export const runtimeLogger = {
  info: (message, context) => logWithLevel("info", message, context),
  warn: (message, context) => logWithLevel("warn", message, context),
  error: (message, context) => logWithLevel("error", message, context),
};

export function initializeRuntimeLogging() {
  if (typeof window === "undefined") return () => {};

  const handleError = (event) => {
    runtimeLogger.error("Uncaught error", {
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error?.message ?? event.message,
      stack: event.error?.stack,
    });
  };

  const handleRejection = (event) => {
    const reason = event.reason;
    runtimeLogger.error("Unhandled promise rejection", {
      reason: typeof reason === "string" ? reason : reason?.message,
      stack: reason?.stack,
    });
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);

  runtimeLogger.info("Runtime logging initialized");

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleRejection);
  };
}
