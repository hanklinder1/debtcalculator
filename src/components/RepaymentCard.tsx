"use client";
import { useState } from "react";
import { fmt } from "@/lib/finance";

interface RepaymentCardProps {
  strategy: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  yearsToPayoff: number;
  forgiven?: number;
  notes: string;
  pros: string[];
  cons: string[];
  highlighted?: boolean;
}

export default function RepaymentCard({
  strategy,
  monthlyPayment,
  totalPaid,
  totalInterest,
  yearsToPayoff,
  forgiven,
  notes,
  pros,
  cons,
  highlighted,
}: RepaymentCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        highlighted
          ? "border-neutral-900 bg-white"
          : "border-neutral-200 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900 text-sm">{strategy}</span>
            {highlighted && (
              <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                Recommended
              </span>
            )}
            {forgiven !== undefined && forgiven > 1000 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                {fmt(forgiven)} forgiven
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">Monthly</p>
              <p className="text-base font-bold text-neutral-900 tabular-nums">{fmt(monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">Total Paid</p>
              <p className="text-base font-bold text-neutral-900 tabular-nums">{fmt(totalPaid)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">Total Interest</p>
              <p className="text-base font-bold text-red-600 tabular-nums">{fmt(totalInterest)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-neutral-400">Payoff</p>
              <p className="text-base font-bold text-neutral-900">{yearsToPayoff} yrs</p>
            </div>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-neutral-400 mt-1 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-neutral-100 pt-4">
          <p className="text-sm text-neutral-500 leading-relaxed">{notes}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 mb-2 uppercase tracking-wider">Pros</p>
              <ul className="space-y-1.5">
                {pros.map((p, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex gap-2">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-red-600 mb-2 uppercase tracking-wider">Cons</p>
              <ul className="space-y-1.5">
                {cons.map((c, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex gap-2">
                    <span className="text-red-500 flex-shrink-0 mt-0.5">-</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
