import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/schemas";
import { apiError, apiSuccess, validationError } from "@/lib/apiResponse";
import { withTimeout, DB_QUERY_TIMEOUT_MS } from "@/lib/timeout";
import type { Task, TaskWithUser, User, UserRole, TaskStatus } from "@/types";
import { mapToUser, mapToTask } from "@/types";
import { ErrorCode } from "@/lib/apiTypes";

/**
 * GET /api/tasks
 * List tasks - Admin sees all, Interns see only their own
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(ErrorCode.UNAUTHORIZED, "You must be logged in to view tasks", 401);
    }

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
    );

    if (!userFromDb) {
      return apiError(ErrorCode.NOT_FOUND, "User not found", 404);
    }

    // Map Prisma result to custom User type
    const user: User = mapToUser(userFromDb);

    let tasks: Task[] | TaskWithUser[];

    if (user.role === "ADMIN") {
      // Admin sees all tasks with user info
      const tasksFromDb = await withTimeout(
        prisma.task.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        DB_QUERY_TIMEOUT_MS
      );

      // Map to TaskWithUser type
      tasks = tasksFromDb.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        fileUrl: t.fileUrl,
        status: t.status as TaskStatus,
        feedback: t.feedback,
        userId: t.userId,
        createdAt: t.createdAt,
        user: {
          id: t.user.id,
          name: t.user.name,
          email: t.user.email,
        },
      })) as TaskWithUser[];
    } else {
      // Intern sees only their tasks - IDOR prevention
      const tasksFromDb = await withTimeout(
        prisma.task.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        }),
        DB_QUERY_TIMEOUT_MS
      );

      tasks = tasksFromDb.map((t) => mapToTask(t));
    }

    return apiSuccess({ tasks }, "Tasks retrieved successfully");
  } catch (error) {
    console.error("Fetch tasks error:", error);

    if (error instanceof Error && error.message === "Request timeout") {
      return apiError(
        ErrorCode.TIMEOUT,
        "Database query timeout. Please try again.",
        504
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to fetch tasks. Please try again.",
      500
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(ErrorCode.UNAUTHORIZED, "You must be logged in to create tasks", 401);
    }

    // Parse and validate request body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return apiError(ErrorCode.INVALID_INPUT, "Invalid JSON payload", 400);
    }

    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationError(
        validation.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
        }))
      );
    }

    const { title, description, fileUrl } = validation.data;

    // Create task
    const taskFromDb = await withTimeout(
      prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          fileUrl: fileUrl || null,
          status: "PENDING",
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          status: true,
          feedback: true,
          userId: true,
          createdAt: true,
        },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    const task: Task = mapToTask(taskFromDb);

    return apiSuccess(
      { task },
      "Task created successfully",
      201
    );
  } catch (error) {
    console.error("Task submission error:", error);

    if (error instanceof Error && error.message === "Request timeout") {
      return apiError(
        ErrorCode.TIMEOUT,
        "Database query timeout. Please try again.",
        504
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to create task. Please try again.",
      500
    );
  }
}
