"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label?: string };
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

const colorMap = {
  primary: { bg: "bg-primary-50", text: "text-primary-700", icon: "bg-primary-100 text-primary-600" },
  success: { bg: "bg-success-light", text: "text-success", icon: "bg-green-100 text-green-600" },
  warning: { bg: "bg-warning-light", text: "text-warning", icon: "bg-amber-100 text-amber-600" },
  danger: { bg: "bg-danger-light", text: "text-danger", icon: "bg-red-100 text-red-600" },
  info: { bg: "bg-info-light", text: "text-info", icon: "bg-blue-100 text-blue-600" },
};

export default function StatsCard({ title, value, icon, trend, color = "primary" }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`text-xs font-medium ${trend.value >= 0 ? "text-success" : "text-danger"}`}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              {trend.label && <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>}
            </div>
          )}
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${colors.icon}`}>
          <div dangerouslySetInnerHTML={{ __html: icon }} />
        </div>
      </div>
    </div>
  );
}