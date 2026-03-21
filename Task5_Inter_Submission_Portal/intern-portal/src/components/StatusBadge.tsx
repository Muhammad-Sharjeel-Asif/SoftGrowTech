import { StatusBadgeProps } from "@/types";

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Pending",
    },
    APPROVED: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      label: "Approved",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      label: "Rejected",
    },
    INTERN: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      label: "Intern",
    },
    ADMIN: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      label: "Admin",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      label: status,
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
