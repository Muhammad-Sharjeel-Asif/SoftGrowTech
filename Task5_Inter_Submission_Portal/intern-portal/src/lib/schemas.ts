import { z } from "zod";
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FEEDBACK_LENGTH,
  ALLOWED_FILE_TYPES,
  TASK_STATUS,
  USER_ROLE,
} from "./constants";

// Authentication schemas
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Password must contain uppercase, lowercase, and number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Task schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
  fileUrl: z.string().url("Invalid URL format").optional().nullable(),
});

export const updateTaskSchema = z.object({
  status: z
    .enum(Object.keys(TASK_STATUS) as [string, ...string[]])
    .optional(),
  feedback: z
    .string()
    .max(MAX_FEEDBACK_LENGTH, `Feedback must be less than ${MAX_FEEDBACK_LENGTH} characters`)
    .optional()
    .nullable(),
});

// File upload schema
export const uploadSchema = z.object({
  file: z.instanceof(File),
});

// Common schemas
export const idParamSchema = z.object({
  id: z.string().cuid("Invalid task ID"),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
