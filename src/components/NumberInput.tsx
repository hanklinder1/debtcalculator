"use client";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  placeholder?: string;
}

export default function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  max,
  step = 1000,
  hint,
  placeholder = "0",
}: NumberInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            onChange(isNaN(raw) ? 0 : Math.max(min, max !== undefined ? Math.min(max, raw) : raw));
          }}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-lg bg-white border border-slate-300 text-slate-900 text-sm py-2.5
            ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-12" : "pr-3"}
            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
            placeholder:text-slate-400 shadow-sm`}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-sm select-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
