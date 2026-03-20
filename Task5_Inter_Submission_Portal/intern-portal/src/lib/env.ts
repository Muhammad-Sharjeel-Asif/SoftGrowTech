import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().url().min(1, "NEXTAUTH_URL is required"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    throw new Error(
      "Invalid environment configuration. Check your .env file."
    );
  }
  return result.data;
}

export const env = validateEnv();
