export const NETWORK_ERROR_MESSAGE =
  "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.";

export const INVALID_RESPONSE_MESSAGE =
  "Respons server tidak valid. Silakan coba lagi.";

export const AUTH_ERROR_MESSAGE =
  "Sesi Anda telah berakhir. Silakan login ulang.";

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  if (error instanceof TypeError) {
    return /failed to fetch|networkerror|load failed|network request failed|fetch failed/i.test(
      error.message,
    );
  }

  return false;
}

export function isInvalidTokenMessage(message: unknown): boolean {
  return (
    typeof message === "string" &&
    /invalid token|no token provided|token tidak valid|token expired|jwt expired|unauthorized|sesi anda telah berakhir/i.test(
      message,
    )
  );
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      const trimmed = message.trim();
      return isInvalidTokenMessage(trimmed) ? AUTH_ERROR_MESSAGE : trimmed;
    }
  }

  return fallback;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): string {
  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (error instanceof SyntaxError) {
    return INVALID_RESPONSE_MESSAGE;
  }

  if (error instanceof Error) {
    const message = error.message?.trim();
    if (message && !/^(network error|failed to fetch)$/i.test(message)) {
      return message;
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
}
