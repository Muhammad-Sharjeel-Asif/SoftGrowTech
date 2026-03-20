import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  console.error(`[API Error ${status}]:`, message, details);
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status }
  );
}

export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiRedirect(url: string) {
  return NextResponse.redirect(new URL(url, process.env.NEXTAUTH_URL));
}
