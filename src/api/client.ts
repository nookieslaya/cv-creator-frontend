export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: string }).error)
        : response.statusText;
    throw new ApiError(message || "Request failed", response.status, payload);
  }

  return payload as T;
}

export async function apiRequestBlob(
  path: string,
  options: RequestOptions,
): Promise<Blob> {
  const { method = "GET", body, token } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error?: string }).error)
        : response.statusText;
    throw new ApiError(message || "Request failed", response.status, payload);
  }

  return response.blob();
}
