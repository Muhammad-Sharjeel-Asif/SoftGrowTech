import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/schemas";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { SALT_ROUNDS } from "@/lib/constants";
import { User, AuthResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting can be added here in future

    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("Invalid JSON payload", 400);
    }

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return apiError("Invalid input", 400, {
        errors: validation.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { name, email, password } = validation.data;

    // Check for existing user
    const existingUserFromDb = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUserFromDb) {
      return apiError("User with this email already exists", 409);
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userFromDb = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "INTERN",
      },
    });

    // Map Prisma result to custom User type (without password)
    const user: User = {
      id: userFromDb.id,
      email: userFromDb.email,
      name: userFromDb.name,
      role: userFromDb.role as "INTERN" | "ADMIN",
    };

    return apiSuccess<AuthResponse>(
      {
        message: "User created successfully",
        user,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Internal server error", 500);
  }
}
