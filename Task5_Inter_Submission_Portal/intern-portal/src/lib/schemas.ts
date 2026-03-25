import { z } from "zod";
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FEEDBACK_LENGTH,
  ALLOWED_FILE_TYPES,
  TASK_STATUS,
  USER_ROLE,
  MIN_PASSWORD_LENGTH,
} from "./constants";

// ============================================
// Authentication Schemas
// ============================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional()
    .nullable(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Password must include at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required"),
});

// ============================================
// Task Schemas
// ============================================

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z
    .string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`
    )
    .optional()
    .nullable(),
  fileUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .nullable(),
});

export const updateTaskSchema = z.object({
  status: z
    .enum(Object.keys(TASK_STATUS) as [string, ...string[]], {
      message: "Status must be PENDING, APPROVED, or REJECTED",
    })
    .optional(),
  feedback: z
    .string()
    .trim()
    .max(
      MAX_FEEDBACK_LENGTH,
      `Feedback must be less than ${MAX_FEEDBACK_LENGTH} characters`
    )
    .optional()
    .nullable(),
});

// ============================================
// File Upload Schema
// ============================================

export const uploadSchema = z.object({
  file: z.instanceof(File, { message: "A file is required" }),
});

// ============================================
// Common Schemas
// ============================================

export const idParamSchema = z.object({
  id: z.string().cuid("Invalid task ID format"),
});

// ============================================
// Environment Schema
// ============================================

export const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL must be a valid PostgreSQL connection string")
    .min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL must be a valid URL")
    .min(1, "NEXTAUTH_URL is required"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters for security"),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z
    .string()
    .min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),
});

// ============================================
// Type Exports
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type EnvInput = z.infer<typeof envSchema>;
