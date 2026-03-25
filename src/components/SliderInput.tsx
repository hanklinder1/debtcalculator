"use client";

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  hint?: string;
}

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format = (v) => v.toString(),
  hint,
}: SliderInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-semibold text-indigo-600 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
