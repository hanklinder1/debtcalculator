"use client";

interface InputCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}

const accents = {
  indigo: "border-indigo-500/30 bg-indigo-500/5",
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
  sky: "border-sky-500/30 bg-sky-500/5",
};

const iconAccents = {
  indigo: "bg-indigo-500/20 text-indigo-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/20 text-amber-400",
  rose: "bg-rose-500/20 text-rose-400",
  sky: "bg-sky-500/20 text-sky-400",
};

export default function InputCard({ title, subtitle, icon, children, accent = "indigo" }: InputCardProps) {
  return (
    <div className={`rounded-xl border ${accents[accent]} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconAccents[accent]} flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
