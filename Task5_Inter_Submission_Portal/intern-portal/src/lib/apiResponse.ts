import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse, ErrorCode } from "./apiTypes";

/**
 * Standardized API error response
 * Never exposes raw error details to clients
 */
export function apiError(
  code: ErrorCode,
  message: string,
  status: number,
  errors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  // Log full error details server-side only
  console.error(`[API Error ${code}]:`, message, errors);

  const response: ApiErrorResponse = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * Standardized API success response
 */
export function apiSuccess<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    ...(message && { message }),
    data,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status });
}

/**
 * API redirect response
 */
export function apiRedirect(url: string): NextResponse {
  return NextResponse.redirect(new URL(url, process.env.NEXTAUTH_URL || "http://localhost:3000"));
}

/**
 * Helper for validation errors from Zod
 */
export function validationError(issues: Array<{ path: string[]; message: string }>): NextResponse<ApiErrorResponse> {
  const errors: Record<string, string[]> = {};
  
  issues.forEach((issue) => {
    const field = issue.path.join(".") || "root";
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(issue.message);
  });

  return apiError(
    "VALIDATION_ERROR" as ErrorCode,
    "Validation failed",
    400,
    errors
  );
}
