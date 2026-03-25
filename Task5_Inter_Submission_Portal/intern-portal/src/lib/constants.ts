// ============================================
// File Upload Configuration
// ============================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES_PER_USER = 50;

// ============================================
// Password Requirements
// ============================================

export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const SALT_ROUNDS = 10;

// ============================================
// Allowed File Types (MIME types)
// ============================================

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

// ============================================
// Valid File Extensions
// ============================================

export const VALID_FILE_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "zip",
  "doc",
  "docx",
] as const;

export type ValidFileExtension = (typeof VALID_FILE_EXTENSIONS)[number];

// ============================================
// Task Status Constants
// ============================================

export const TASK_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// ============================================
// User Role Constants
// ============================================

export const USER_ROLE = {
  INTERN: "INTERN",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

// ============================================
// API Response Limits
// ============================================

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_FEEDBACK_LENGTH = 2000;

// ============================================
// Rate Limiting Configuration
// ============================================

export const RATE_LIMIT = {
  // Auth endpoints: 5 requests per minute
  AUTH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // General API: 100 requests per minute
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Upload endpoint: 10 requests per minute
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
};

// ============================================
// Security Headers
// ============================================

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
