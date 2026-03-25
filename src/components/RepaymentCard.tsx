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
      className={`rounded-xl border transition-all ${
        highlighted
          ? "border-indigo-500/50 bg-indigo-500/8"
          : "border-slate-700/60 bg-slate-900/60"
      } overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-start justify-between gap-4"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-100 text-sm">{strategy}</span>
            {forgiven !== undefined && forgiven > 1000 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                {fmt(forgiven)} forgiven
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <p className="text-xs text-slate-500">Monthly</p>
              <p className="text-base font-bold text-slate-100 tabular-nums">{fmt(monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Paid</p>
              <p className="text-base font-bold text-slate-100 tabular-nums">{fmt(totalPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Interest</p>
              <p className="text-base font-bold text-rose-400 tabular-nums">{fmt(totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Payoff Time</p>
              <p className="text-base font-bold text-slate-100">{yearsToPayoff} yrs</p>
            </div>
          </div>
        </div>
        <span className={`text-slate-400 text-lg mt-1 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          ›
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
          <p className="text-sm text-slate-400 leading-relaxed">{notes}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wide">Pros</p>
              <ul className="space-y-1">
                {pros.map((p, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-400 mb-1.5 uppercase tracking-wide">Cons</p>
              <ul className="space-y-1">
                {cons.map((c, i) => (
                  <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                    <span className="text-rose-500 flex-shrink-0 mt-0.5">✗</span>
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
