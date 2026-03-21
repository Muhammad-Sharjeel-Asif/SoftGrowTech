// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt?: Date;
}

export type UserRole = "INTERN" | "ADMIN";

export interface UserWithTasks extends User {
  tasks: Task[];
}

export interface UserWithTaskCount extends User {
  _count: {
    tasks: number;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

// ============================================
// Task Types
// ============================================

export type TaskStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  status: TaskStatus;
  feedback: string | null;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TaskWithUser extends Task {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface TaskFormData {
  title: string;
  description?: string;
  fileUrl?: string;
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
  user: Omit<User, "password">;
}

// ============================================
// Component Props Types
// ============================================

export interface StatusBadgeProps {
  status: string;
}

export interface TaskActionsProps {
  taskId: string;
  currentStatus: string;
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

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name?: string;
  email: string;
  password: string;
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
