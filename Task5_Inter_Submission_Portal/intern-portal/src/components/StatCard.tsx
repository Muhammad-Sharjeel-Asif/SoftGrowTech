interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  trend?: {
    value: number;
    label: string;
  };
}

export default function StatCard({
  label,
  value,
  icon = "📊",
  color = "blue",
  trend,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-100",
      iconBg: "bg-green-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-100",
      iconBg: "bg-yellow-100",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-100",
      iconBg: "bg-red-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-100",
      iconBg: "bg-purple-100",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} p-6 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} opacity-80`}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.value >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.iconBg} text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
