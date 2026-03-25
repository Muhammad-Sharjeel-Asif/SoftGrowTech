// ============================================
// Core Domain Types (Single Source of Truth)
// ============================================
// These types are the authoritative definitions for all domain entities.
// NEVER import from @prisma/client in UI or API layers.
// Always map database results to these types.

export type UserRole = "INTERN" | "ADMIN";

export type TaskStatus = "PENDING" | "APPROVED" | "REJECTED";

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date | null;
}

/**
 * User with their tasks - for dashboard views
 */
export interface UserWithTasks extends User {
  tasks: Task[];
}

/**
 * User with task count - for admin user list
 */
export interface UserWithTaskCount extends User {
  _count: {
    tasks: number;
  };
}

/**
 * Minimal user info for nested relations (without sensitive data)
 */
export interface UserInfo {
  id: string;
  name: string | null;
  email: string;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  status: TaskStatus;
  feedback: string | null;
  userId: string;
  createdAt: Date;
}

/**
 * Task with full user information
 */
export interface TaskWithUser extends Task {
  user: UserInfo;
}

export interface TaskFormData {
  title: string;
  description?: string;
  fileUrl?: string;
}

// ============================================
// Session Types (NextAuth)
// ============================================

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  pendingTasks: number;
  approvedTasks: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TasksResponse {
  tasks: Task[] | TaskWithUser[];
}

export interface TaskResponse {
  task: Task | TaskWithUser;
}

export interface UploadResponse {
  message: string;
  url: string;
  publicId: string;
  fileType?: string;
  fileSize?: number;
}

export interface AuthResponse {
  message: string;
  user: User;
}

// ============================================
// Component Props Types
// ============================================

export interface StatusBadgeProps {
  status: UserRole | TaskStatus;
}

export interface TaskActionsProps {
  taskId: string;
  currentStatus: TaskStatus;
  currentFeedback: string | null;
  onStatusChange: () => void;
}

export interface StatCardProps {
  label: string;
  value: number | string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string | null;
  email: string;
  password: string;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// ============================================
// Database Mapping Helpers
// ============================================

/**
 * Maps a Prisma User result to the domain User type.
 * This ensures consistent types across the application.
 */
export function mapToUser(dbUser: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date | null;
}): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as UserRole,
    createdAt: dbUser.createdAt,
  };
}

/**
 * Maps a Prisma Task result to the domain Task type.
 */
export function mapToTask(dbTask: {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  status: string;
  feedback: string | null;
  userId: string;
  createdAt: Date;
}): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    fileUrl: dbTask.fileUrl,
    status: dbTask.status as TaskStatus,
    feedback: dbTask.feedback,
    userId: dbTask.userId,
    createdAt: dbTask.createdAt,
  };
}

/**
 * Maps a Prisma Task with User relation to TaskWithUser type.
 */
export function mapToTaskWithUser(
  dbTask: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string | null;
    status: string;
    feedback: string | null;
    userId: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  },
): TaskWithUser {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    fileUrl: dbTask.fileUrl,
    status: dbTask.status as TaskStatus,
    feedback: dbTask.feedback,
    userId: dbTask.userId,
    createdAt: dbTask.createdAt,
    user: {
      id: dbTask.user.id,
      name: dbTask.user.name,
      email: dbTask.user.email,
    },
  };
}
