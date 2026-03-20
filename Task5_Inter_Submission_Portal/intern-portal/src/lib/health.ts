import { prisma } from "@/lib/prisma";
import { withTimeout, DB_QUERY_TIMEOUT_MS } from "@/lib/timeout";

export interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: {
    status: "connected" | "disconnected";
    responseTime?: number;
  };
  timestamp: string;
}

export async function checkDatabaseHealth(): Promise<{
  status: "connected" | "disconnected";
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    await withTimeout(
      prisma.$queryRaw`SELECT 1`,
      DB_QUERY_TIMEOUT_MS,
      "Database health check timeout"
    );

    const responseTime = Date.now() - startTime;

    return {
      status: "connected",
      responseTime,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    return {
      status: "disconnected",
    };
  }
}

export async function getSystemHealth(): Promise<HealthStatus> {
  const database = await checkDatabaseHealth();

  return {
    status: database.status === "connected" ? "healthy" : "unhealthy",
    database,
    timestamp: new Date().toISOString(),
  };
}
