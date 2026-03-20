import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/schemas";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { SALT_ROUNDS } from "@/lib/constants";

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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return apiError("User with this email already exists", 409);
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "INTERN",
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return apiSuccess(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return apiError("Internal server error", 500);
  }
}
