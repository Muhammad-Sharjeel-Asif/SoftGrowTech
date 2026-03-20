import { NextResponse } from "next/server";
import { getSystemHealth } from "@/lib/health";

export async function GET() {
  try {
    const health = await getSystemHealth();

    return NextResponse.json(health, {
      status: health.status === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
