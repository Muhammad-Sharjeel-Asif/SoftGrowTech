import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { fileTypeFromBuffer } from "file-type";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  MAX_FILES_PER_USER,
  ALLOWED_FILE_TYPES,
  VALID_FILE_EXTENSIONS,
} from "@/lib/constants";
import { withTimeout, UPLOAD_TIMEOUT_MS } from "@/lib/timeout";
import type { UploadResponse } from "@/types";
import { ErrorCode } from "@/lib/apiTypes";

/**
 * POST /api/upload
 * Secure file upload endpoint with comprehensive validation
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError(ErrorCode.UNAUTHORIZED, "You must be logged in to upload files", 401);
    }

    const userId = session.user.id;

    // 2. Check file upload limit per user
    const userTasksWithFiles = await withTimeout(
      prisma.task.findMany({
        where: { userId, fileUrl: { not: null } },
        select: { id: true },
      }),
      UPLOAD_TIMEOUT_MS
    );

    if (userTasksWithFiles.length >= MAX_FILES_PER_USER) {
      return apiError(
        ErrorCode.FILE_LIMIT_REACHED,
        `File limit reached. Maximum ${MAX_FILES_PER_USER} files allowed per user.`,
        403
      );
    }

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError(ErrorCode.INVALID_INPUT, "No file provided", 400);
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        ErrorCode.FILE_TOO_LARGE,
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
        400
      );
    }

    // 5. Validate file name
    const fileName = file.name.toLowerCase();
    if (!fileName || fileName.length > 255) {
      return apiError(ErrorCode.INVALID_INPUT, "Invalid file name", 400);
    }

    // 6. Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. Validate file type using magic bytes (not client-provided MIME type)
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      buffer.fill(0); // Clear buffer to free memory
      return apiError(
        ErrorCode.INVALID_FILE_TYPE,
        "Unable to detect file type. File may be corrupted or in an unsupported format.",
        400
      );
    }

    // 8. Check against allowed MIME types
    if (!ALLOWED_FILE_TYPES.includes(detectedType.mime as never)) {
      buffer.fill(0);
      return apiError(
        ErrorCode.INVALID_FILE_TYPE,
        "File type not allowed. Allowed types: PDF, Images (JPEG, PNG, GIF), ZIP, DOC, DOCX",
        400
      );
    }

    // 9. Validate file extension
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (!fileExtension || !VALID_FILE_EXTENSIONS.includes(fileExtension as never)) {
      buffer.fill(0);
      return apiError(
        ErrorCode.INVALID_FILE_TYPE,
        "File extension not allowed",
        400
      );
    }

    // 10. Additional security: Block potentially dangerous files
    if (fileExtension === "svg") {
      buffer.fill(0);
      return apiError(
        ErrorCode.INVALID_FILE_TYPE,
        "SVG files are not allowed for security reasons",
        400
      );
    }

    // 11. Upload to Cloudinary with timeout
    let result: { secure_url: string; public_id: string };

    try {
      result = await withTimeout(
        new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "intern-portal/submissions",
              resource_type: "auto",
              public_id: `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              allowed_formats: [...VALID_FILE_EXTENSIONS],
              overwrite: false,
              use_filename: false,
            },
            (error, uploadResult) => {
              // Clear buffer to free memory
              buffer.fill(0);

              if (error) {
                reject(error);
              } else if (uploadResult) {
                resolve({
                  secure_url: uploadResult.secure_url,
                  public_id: uploadResult.public_id,
                });
              }
            }
          );

          uploadStream.on("error", (err) => {
            buffer.fill(0);
            reject(err);
          });

          uploadStream.end(buffer);
        }),
        UPLOAD_TIMEOUT_MS
      );
    } catch (uploadError) {
      buffer.fill(0);
      console.error("Cloudinary upload error:", uploadError);
      return apiError(
        ErrorCode.DATABASE_ERROR,
        "Failed to upload file. Please try again.",
        500
      );
    }

    // 12. Return success response
    return apiSuccess<UploadResponse>(
      {
        message: "File uploaded successfully",
        url: result.secure_url,
        publicId: result.public_id,
        fileType: detectedType.mime,
        fileSize: file.size,
      },
      "File uploaded successfully"
    );
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof Error && error.message === "Request timeout") {
      return apiError(
        ErrorCode.TIMEOUT,
        "Upload timeout. Please try again.",
        504
      );
    }

    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to upload file. An unexpected error occurred.",
      500
    );
  }
}
