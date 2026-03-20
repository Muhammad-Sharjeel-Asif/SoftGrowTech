import { StatusBadgeProps } from "@/types";

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: "⏳",
      label: "Pending",
      ariaLabel: "Pending status",
    },
    APPROVED: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "✓",
      label: "Approved",
      ariaLabel: "Approved status",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "✗",
      label: "Rejected",
      ariaLabel: "Rejected status",
    },
    INTERN: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "👤",
      label: "Intern",
      ariaLabel: "Intern role",
    },
    ADMIN: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: "👑",
      label: "Admin",
      ariaLabel: "Admin role",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: "•",
      label: status,
      ariaLabel: status,
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      <span role="img" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}
