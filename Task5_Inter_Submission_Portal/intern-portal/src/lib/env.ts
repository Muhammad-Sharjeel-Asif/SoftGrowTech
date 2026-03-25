import { z } from "zod";
import { envSchema, type EnvInput } from "./schemas";

let validatedEnv: EnvInput | null = null;

/**
 * Validate environment variables using Zod
 * Crashes the application if validation fails
 * This ensures we fail fast on startup rather than at runtime
 */
export function validateEnv(): EnvInput {
  if (validatedEnv) {
    return validatedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("\n❌ CRITICAL: Invalid Environment Configuration\n");
    console.error("The following environment variables are missing or invalid:\n");

    const errorMap = result.error.format();

    Object.entries(errorMap).forEach(([field, error]) => {
      if (field !== "_errors" && error) {
        const messages = Array.isArray(error) ? error : error._errors || [error];
        console.error(`  • ${field}: ${messages.join(", ")}`);
      }
    });

    console.error("\n📝 Please check your .env file and ensure all required variables are set.\n");

    // Crash the application - fail fast on startup
    throw new Error("Environment validation failed. Application cannot start.");
  }

  validatedEnv = result.data;
  return validatedEnv;
}

/**
 * Export validated environment variables
 * This is the single source of truth for env access
 */
export const env = validateEnv();

/**
 * Individual exports for convenience and type safety
 */
export const DATABASE_URL = env.DATABASE_URL;
export const NEXTAUTH_URL = env.NEXTAUTH_URL;
export const NEXTAUTH_SECRET = env.NEXTAUTH_SECRET;
export const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;
