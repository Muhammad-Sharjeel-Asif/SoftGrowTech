import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/schemas";
import { apiError, apiSuccess, validationError } from "@/lib/apiResponse";
import { SALT_ROUNDS } from "@/lib/constants";
import type { User } from "@/types";
import { mapToUser } from "@/types";
import { ErrorCode } from "@/lib/apiTypes";

/**
 * POST /api/auth/register
 * User registration endpoint with comprehensive validation
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return apiError(
        ErrorCode.INVALID_INPUT,
        "Invalid JSON payload",
        400
      );
    }

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return validationError(
        validation.error.issues.map((issue) => ({
          path: issue.path.map(String),
          message: issue.message,
        }))
      );
    }

    const { name, email, password } = validation.data;

    // 2. Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (existingUser) {
      return apiError(
        ErrorCode.ALREADY_EXISTS,
        "User with this email already exists",
        409
      );
    }

    // 3. Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Create user
    const userFromDb = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email,
        password: hashedPassword,
        role: "INTERN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // 5. Map to domain User type
    const user: User = mapToUser(userFromDb);

    return apiSuccess(
      {
        message: "User created successfully",
        user,
      },
      "Account created successfully",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle unique constraint violation
    if (
      error instanceof Error &&
      (error.message.includes("Unique constraint") ||
        (error as Error & { code?: string }).code === "P2002")
    ) {
      return apiError(
        ErrorCode.ALREADY_EXISTS,
        "User with this email already exists",
        409
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to create account. Please try again.",
      500
    );
  }
}
