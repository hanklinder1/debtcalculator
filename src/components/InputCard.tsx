"use client";

interface InputCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function InputCard({ title, subtitle, children }: InputCardProps) {
  return (
    <div className="border border-neutral-200 rounded-xl p-6 space-y-5 bg-white">
      <div>
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
