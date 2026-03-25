"use client";

interface MetricBadgeProps {
  label: string;
  value: string;
  flag?: "good" | "warn" | "bad" | "neutral";
  size?: "sm" | "lg";
}

const flagStyles = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  bad: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-white text-slate-700",
};

const flagIcons = {
  good: "✓",
  warn: "⚠",
  bad: "✗",
  neutral: "–",
};

export default function MetricBadge({ label, value, flag = "neutral", size = "sm" }: MetricBadgeProps) {
  return (
    <div className={`rounded-lg border ${flagStyles[flag]} p-3 flex flex-col gap-1 shadow-sm`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold opacity-50">{flagIcons[flag]}</span>
        <span className={`${size === "lg" ? "text-base" : "text-xs"} text-slate-500 font-medium`}>{label}</span>
      </div>
      <span className={`${size === "lg" ? "text-2xl" : "text-lg"} font-bold tabular-nums`}>{value}</span>
    </div>
  );
}
