export const DB_QUERY_TIMEOUT_MS = 5000;
export const UPLOAD_TIMEOUT_MS = 30000;

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Request timeout"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export function createTimeoutController(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, timeoutId };
}
