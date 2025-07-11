import { Result, ok, err } from "neverthrow";

type ApiResponse<T> = {
  data: T;
};

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
};

export class ApiException extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<Result<T, ApiException>> {
  const { method = "GET", body, headers = {} } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorMessage = "Request failed";
      let errorCode: string | undefined;

      try {
        const errorResponse = (await response.json()) as ApiError;
        errorMessage = errorResponse.error?.message || errorMessage;
        errorCode = errorResponse.error?.code;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      return err(new ApiException(errorMessage, errorCode, response.status));
    }

    const result = (await response.json()) as ApiResponse<T>;
    return ok(result.data);
  } catch (error) {
    return err(
      new ApiException(
        error instanceof Error ? error.message : "Unknown error occurred",
        "NETWORK_ERROR",
      ),
    );
  }
}

export const api = {
  get: <T>(url: string, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "GET", headers }),

  post: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "POST", body, headers }),

  put: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "PUT", body, headers }),

  patch: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "PATCH", body, headers }),

  delete: <T>(url: string, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "DELETE", headers }),
};
