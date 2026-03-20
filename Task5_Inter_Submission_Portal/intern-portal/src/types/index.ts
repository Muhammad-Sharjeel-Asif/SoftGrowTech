// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: "INTERN" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithTasks extends User {
  tasks: Task[];
}

export interface UserWithTaskCount extends User {
  _count: {
    tasks: number;
  };
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback: string | null;
  userId: string;
  createdAt: Date;
  updatedAt?: Date; // Optional as it's not always selected
}

export interface TaskWithUser extends Task {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Session types
export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}

// Form types
export interface TaskFormData {
  title: string;
  description?: string;
  fileUrl?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name?: string;
  email: string;
  password: string;
}

// Component props types
export interface TaskActionsProps {
  taskId: string;
  currentStatus: string;
  currentFeedback: string | null;
  onStatusChange: () => void;
}

export interface StatusBadgeProps {
  status: string;
}

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  trend?: {
    value: number;
    label: string;
  };
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Dashboard types
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
