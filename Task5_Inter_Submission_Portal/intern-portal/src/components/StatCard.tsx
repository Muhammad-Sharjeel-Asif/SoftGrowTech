import { StatCardProps } from "@/types";

export default function StatCard({
  label,
  value,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100/50",
      text: "text-green-700",
      border: "border-green-200",
    },
    yellow: {
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100/50",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/50",
      text: "text-red-700",
      border: "border-red-200",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-6 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="relative">
        <p className={`text-sm font-medium ${colors.text}`}>
          {label}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${colors.bg} opacity-50`} />
    </div>
  );
}
