"use client";

import { PathStep } from "@/lib/finance";

interface SuggestedPathProps {
  steps: PathStep[];
}

const priorityStyles = {
  critical: "bg-red-50 border-red-200 text-red-700",
  high: "bg-amber-50 border-amber-200 text-amber-700",
  medium: "bg-neutral-50 border-neutral-200 text-neutral-700",
  low: "bg-neutral-50 border-neutral-100 text-neutral-500",
};

const priorityDots = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-neutral-400",
  low: "bg-neutral-300",
};

export default function SuggestedPath({ steps }: SuggestedPathProps) {
  if (steps.length === 0) {
    return (
      <div className="border border-neutral-200 rounded-xl bg-white p-12 text-center">
        <p className="text-neutral-400">Enter your financial details to receive a suggested path.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-neutral-200 rounded-xl bg-white p-6">
        <h2 className="font-semibold text-neutral-900 mb-1">Your Suggested Path</h2>
        <p className="text-sm text-neutral-500">
          A structured action plan based on your financial situation. Follow these steps in order for the best outcome.
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-neutral-200" />

        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.order} className="relative flex gap-4">
              {/* Step number */}
              <div className="w-[55px] flex-shrink-0 flex items-start justify-center pt-5 z-10">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                  {step.order}
                </div>
              </div>

              {/* Card */}
              <div className={`flex-1 border rounded-xl p-5 ${priorityStyles[step.priority]}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-neutral-900 text-sm">{step.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${priorityDots[step.priority]}`} />
                    <span className="text-[10px] uppercase tracking-wider font-medium">{step.priority}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{step.description}</p>
                <p className="text-xs text-neutral-400 mt-3 font-medium">{step.timeframe}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
