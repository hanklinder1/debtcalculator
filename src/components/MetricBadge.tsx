"use client";

interface MetricBadgeProps {
  label: string;
  value: string;
  flag?: "good" | "warn" | "bad" | "neutral";
  size?: "sm" | "lg";
}

const flagStyles = {
  good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  bad: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  neutral: "border-slate-600 bg-slate-800 text-slate-300",
};

const flagIcons = {
  good: "✓",
  warn: "⚠",
  bad: "✗",
  neutral: "–",
};

export default function MetricBadge({ label, value, flag = "neutral", size = "sm" }: MetricBadgeProps) {
  return (
    <div className={`rounded-lg border ${flagStyles[flag]} p-3 flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold opacity-60">{flagIcons[flag]}</span>
        <span className={`${size === "lg" ? "text-base" : "text-xs"} text-slate-400 font-medium`}>{label}</span>
      </div>
      <span className={`${size === "lg" ? "text-2xl" : "text-lg"} font-bold tabular-nums`}>{value}</span>
    </div>
  );
}
