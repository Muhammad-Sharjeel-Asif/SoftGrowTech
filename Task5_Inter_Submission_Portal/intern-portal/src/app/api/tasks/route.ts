import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/schemas";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { withTimeout, DB_QUERY_TIMEOUT_MS } from "@/lib/timeout";
import { Task, TaskWithUser, User } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    // Get user to check role
    const userFromDb = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    if (!userFromDb) {
      return apiError("User not found", 404);
    }

    // Map Prisma result to custom User type
    const user: User = {
      id: userFromDb.id,
      email: userFromDb.email,
      name: userFromDb.name,
      role: userFromDb.role as "INTERN" | "ADMIN",
    };

    let tasks: Task[] | TaskWithUser[];

    if (user.role === "ADMIN") {
      // Admin sees all tasks with user info
      const tasksWithUser = await withTimeout(
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
      tasks = tasksWithUser.map((t) => ({
        ...t,
        user: {
          id: t.user.id,
          name: t.user.name,
          email: t.user.email,
        },
      })) as TaskWithUser[];
    } else {
      // Intern sees only their tasks
      tasks = await withTimeout(
        prisma.task.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        }),
        DB_QUERY_TIMEOUT_MS
      ) as Task[];
    }

    return apiSuccess<{ tasks: typeof tasks }>({ tasks });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    if (error instanceof Error && error.message === "Request timeout") {
      return apiError("Database query timeout. Please try again.", 504);
    }
    return apiError("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return apiError("Invalid input", 400, {
        errors: validation.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { title, description, fileUrl } = validation.data;

    // Create task
    const task = await withTimeout(
      prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          fileUrl: fileUrl || null,
          status: "PENDING",
          userId: session.user.id,
        },
      }),
      DB_QUERY_TIMEOUT_MS
    );

    return apiSuccess<{ task: typeof task }>({ task });
  } catch (error) {
    console.error("Task submission error:", error);
    if (error instanceof Error && error.message === "Request timeout") {
      return apiError("Database query timeout. Please try again.", 504);
    }
    return apiError("Internal server error", 500);
  }
}
