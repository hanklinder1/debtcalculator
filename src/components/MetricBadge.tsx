"use client";

interface MetricBadgeProps {
  label: string;
  value: string;
  flag?: "good" | "warn" | "bad" | "neutral";
  size?: "sm" | "lg";
}

const flagStyles = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-700",
};

const flagDots = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
  neutral: "bg-neutral-400",
};

export default function MetricBadge({ label, value, flag = "neutral", size = "sm" }: MetricBadgeProps) {
  return (
    <div className={`rounded-lg border ${flagStyles[flag]} p-3 flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${flagDots[flag]}`} />
        <span className={`${size === "lg" ? "text-sm" : "text-xs"} text-neutral-500 font-medium`}>{label}</span>
      </div>
      <span className={`${size === "lg" ? "text-2xl" : "text-lg"} font-bold tabular-nums`}>{value}</span>
    </div>
  );
}
