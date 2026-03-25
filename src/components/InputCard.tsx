"use client";

interface InputCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "sky";
}

const accents = {
  indigo: "border-indigo-200 bg-indigo-50",
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  rose: "border-rose-200 bg-rose-50",
  sky: "border-sky-200 bg-sky-50",
};

const iconAccents = {
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  sky: "bg-sky-100 text-sky-600",
};

export default function InputCard({ title, subtitle, icon, children, accent = "indigo" }: InputCardProps) {
  return (
    <div className={`rounded-xl border ${accents[accent]} p-5 space-y-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconAccents[accent]} flex items-center justify-center text-lg flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
