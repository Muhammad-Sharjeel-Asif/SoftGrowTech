import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { fileTypeFromBuffer } from "file-type";
import {
  MAX_FILE_SIZE,
  MAX_FILES_PER_USER,
  ALLOWED_FILE_TYPES,
} from "@/lib/constants";
import { withTimeout, UPLOAD_TIMEOUT_MS } from "@/lib/timeout";
import { UploadResponse } from "@/types";
import { User } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    // Get user - explicitly typed
    const user: User | null = await withTimeout(
      prisma.user.findUnique({
        where: { id: session.user.id },
      }),
      UPLOAD_TIMEOUT_MS
    );

    if (!user) {
      return apiError("User not found", 404);
    }

    // Check file upload limit per user
    const userTasksWithFiles = await withTimeout(
      prisma.task.findMany({
        where: { userId: session.user.id, fileUrl: { not: null } },
        select: { id: true },
      }),
      UPLOAD_TIMEOUT_MS
    );

    if (userTasksWithFiles.length >= MAX_FILES_PER_USER) {
      return apiError(
        `File limit reached. Maximum ${MAX_FILES_PER_USER} files allowed.`,
        403
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        400
      );
    }

    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type using magic bytes (not client-provided MIME type)
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      buffer.fill(0); // Clear buffer
      return apiError(
        "Unable to detect file type. File may be corrupted.",
        400
      );
    }

    // Check against allowed MIME types
    if (!ALLOWED_FILE_TYPES.includes(detectedType.mime as never)) {
      buffer.fill(0); // Clear buffer
      return apiError(
        `File type not allowed. Allowed types: PDF, Images (JPEG, PNG, GIF), ZIP, DOC, DOCX`,
        400
      );
    }

    // Additional extension validation for extra security
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "zip",
      "doc",
      "docx",
    ];

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      buffer.fill(0);
      return apiError("File extension not allowed", 400);
    }

    // Upload to Cloudinary with timeout
    let result: { secure_url: string; public_id: string };
    try {
      result = await withTimeout(
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "intern-portal/submissions",
              resource_type: "auto",
              public_id: `${session.user.id}_${Date.now()}`,
              allowed_formats: validExtensions,
            },
            (error, result) => {
              // Clear buffer to free memory
              buffer.fill(0);

              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
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
      return apiError("Failed to upload file. Please try again.", 500);
    }

    return apiSuccess<UploadResponse>({
      message: "File uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      fileType: detectedType.mime,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error && error.message === "Request timeout") {
      return apiError("Upload timeout. Please try again.", 504);
    }
    return apiError("Failed to upload file", 500);
  }
}
