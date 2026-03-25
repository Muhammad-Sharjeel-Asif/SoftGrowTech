import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/health";
import { ErrorCode } from "@/lib/apiTypes";

/**
 * GET /api/health
 * System health check endpoint
 */
export async function GET() {
  try {
    const health = await getSystemHealth();

    return NextResponse.json(
      {
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      },
      {
        status: health.status === "healthy" ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
