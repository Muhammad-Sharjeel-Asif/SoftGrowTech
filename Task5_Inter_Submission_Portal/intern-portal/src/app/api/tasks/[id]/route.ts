import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema, idParamSchema } from "@/lib/schemas";
import { apiError, apiSuccess, validationError } from "@/lib/apiResponse";
import { withTimeout, DB_QUERY_TIMEOUT_MS } from "@/lib/timeout";
import type { Task, TaskWithUser, User, UserRole, TaskStatus } from "@/types";
import { mapToUser } from "@/types";
import { ErrorCode } from "@/lib/apiTypes";

// Type for Prisma user query result
type DbUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
};

// Type for Prisma task query result with user relation
type DbTaskWithUser = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  status: string;
  feedback: string | null;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

/**
 * GET /api/tasks/[id]
 * Get single task by ID with IDOR protection
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(ErrorCode.UNAUTHORIZED, "You must be logged in to view tasks", 401);
    }

    // Validate params
    const { id } = idParamSchema.parse(await params);

    // Get user to check role
    const userFromDb = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      DB_QUERY_TIMEOUT_MS
    ) as DbUser | null;

    if (!userFromDb) {
      return apiError(ErrorCode.NOT_FOUND, "User not found", 404);
    }

    // Map Prisma result to custom User type
    const user: User = mapToUser(userFromDb);

    // IDOR FIX: Use findFirst with userId in WHERE clause for non-admin users
    // This prevents enumeration attacks by always returning 404 for unauthorized access
    const taskFromDb = await withTimeout(
      prisma.task.findFirst({
        where: user.role === "ADMIN"
          ? { id }
          : { id, userId: session.user.id }, // Interns can only query their own tasks
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
    ) as DbTaskWithUser | null;

    if (!taskFromDb) {
      return apiError(ErrorCode.NOT_FOUND, "Task not found", 404);
    }

    // Map to TaskWithUser type
    const task: TaskWithUser = {
      id: taskFromDb.id,
      title: taskFromDb.title,
      description: taskFromDb.description,
      fileUrl: taskFromDb.fileUrl,
      status: taskFromDb.status as TaskStatus,
      feedback: taskFromDb.feedback,
      userId: taskFromDb.userId,
      createdAt: taskFromDb.createdAt,
      user: {
        id: taskFromDb.user.id,
        name: taskFromDb.user.name,
        email: taskFromDb.user.email,
      },
    };

    return apiSuccess(task, "Task retrieved successfully");
  } catch (error) {
    console.error("Fetch task error:", error);

    if (error instanceof Error && error.message === "Request timeout") {
      return apiError(
        ErrorCode.TIMEOUT,
        "Database query timeout. Please try again.",
        504
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch task. Please try again.",
      500
    );
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update task status/feedback (Admin only) with IDOR protection
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(ErrorCode.UNAUTHORIZED, "You must be logged in to update tasks", 401);
    }

    // Validate params
    const { id } = idParamSchema.parse(await params);

    // Get user to check role
    const userFromDb = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      DB_QUERY_TIMEOUT_MS
    ) as DbUser | null;

    if (!userFromDb) {
      return apiError(ErrorCode.NOT_FOUND, "User not found", 404);
    }

    // Map Prisma result to custom User type
    const user: User = mapToUser(userFromDb);

    // Admin-only endpoint for status updates
    if (user.role !== "ADMIN") {
      return apiError(
        ErrorCode.FORBIDDEN,
        "Admin access required to update tasks",
        403
      );
    }

    // Parse and validate request body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return apiError(ErrorCode.INVALID_INPUT, "Invalid JSON payload", 400);
    }

    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationError(
        validation.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
        }))
      );
    }

    const { status, feedback } = validation.data;

    // Validate that at least one field is provided
    if (!status && feedback === undefined) {
      return apiError(
        ErrorCode.INVALID_INPUT,
        "Either status or feedback must be provided",
        400
      );
    }

    // IDOR FIX: Use findFirst with proper authorization check
    const existingTask = await withTimeout(
      prisma.task.findFirst({
        where: { id },
        select: { id: true, userId: true },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!existingTask) {
      return apiError(ErrorCode.NOT_FOUND, "Task not found", 404);
    }

    // Update task
    const taskFromDb = await withTimeout(
      prisma.task.update({
        where: { id },
        data: {
          ...(status && { status: status as TaskStatus }),
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
    ) as DbTaskWithUser | null;

    if (!taskFromDb) {
      return apiError(ErrorCode.NOT_FOUND, "Task not found", 404);
    }

    // Map to TaskWithUser type
    const task: TaskWithUser = {
      id: taskFromDb.id,
      title: taskFromDb.title,
      description: taskFromDb.description,
      fileUrl: taskFromDb.fileUrl,
      status: taskFromDb.status as TaskStatus,
      feedback: taskFromDb.feedback,
      userId: taskFromDb.userId,
      createdAt: taskFromDb.createdAt,
      user: {
        id: taskFromDb.user.id,
        name: taskFromDb.user.name,
        email: taskFromDb.user.email,
      },
    };

    return apiSuccess(
      task,
      status === "APPROVED"
        ? "Task approved successfully"
        : status === "REJECTED"
        ? "Task rejected successfully"
        : "Task updated successfully"
    );
  } catch (error) {
    console.error("Update task error:", error);

    if (error instanceof Error && error.message === "Request timeout") {
      return apiError(
        ErrorCode.TIMEOUT,
        "Database query timeout. Please try again.",
        504
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to update task. Please try again.",
      500
    );
  }
}
