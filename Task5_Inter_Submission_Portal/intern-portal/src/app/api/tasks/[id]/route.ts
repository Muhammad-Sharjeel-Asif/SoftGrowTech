import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema, idParamSchema } from "@/lib/schemas";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { withTimeout, DB_QUERY_TIMEOUT_MS } from "@/lib/timeout";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    // Validate params
    const { id } = idParamSchema.parse(await params);

    // Get user to check role
    const user = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!user) {
      return apiError("User not found", 404);
    }

    // Fetch task
    const task = await withTimeout(
      prisma.task.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!task) {
      return apiError("Task not found", 404);
    }

    // Interns can only view their own tasks
    if (user.role !== "ADMIN" && task.userId !== session.user.id) {
      return apiError("Forbidden", 403);
    }

    return apiSuccess({ task });
  } catch (error) {
    console.error("Fetch task error:", error);
    if (error instanceof Error && error.message === "Request timeout") {
      return apiError("Database query timeout. Please try again.", 504);
    }
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    // Validate params
    const { id } = idParamSchema.parse(await params);

    // Get user to check role
    const user = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!user) {
      return apiError("User not found", 404);
    }

    // Admin-only endpoint for status updates
    if (user.role !== "ADMIN") {
      return apiError("Admin access required", 403);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return apiError("Invalid input", 400, {
        errors: validation.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { status, feedback } = validation.data;

    // Validate that at least one field is provided
    if (!status && feedback === undefined) {
      return apiError("Either status or feedback must be provided", 400);
    }

    // Verify task exists before updating
    const existingTask = await withTimeout(
      prisma.task.findUnique({ where: { id } }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!existingTask) {
      return apiError("Task not found", 404);
    }

    // Update task
    const task = await withTimeout(
      prisma.task.update({
        where: { id },
        data: {
          ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" }),
          ...(feedback !== undefined && { feedback }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    return apiSuccess({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    if (error instanceof Error && error.message === "Request timeout") {
      return apiError("Database query timeout. Please try again.", 504);
    }
    return apiError("Internal server error", 500);
  }
}
