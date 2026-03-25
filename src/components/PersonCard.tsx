"use client";

import { useState } from "react";
import { PersonInputs } from "@/lib/finance";
import NumberInput from "./NumberInput";
import SliderInput from "./SliderInput";

interface PersonCardProps {
  person: PersonInputs;
  index: number;
  canRemove: boolean;
  onChange: (updated: PersonInputs) => void;
  onRemove: () => void;
}

const fmtRate = (v: number) => `${v.toFixed(2)}%`;

export default function PersonCard({ person, index, canRemove, onChange, onRemove }: PersonCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const set = (key: keyof PersonInputs) => (val: number | string) =>
    onChange({ ...person, [key]: val });

  const hasDebt = person.currentDebt > 0;
  const hasSchool = person.schoolCost > 0;
  const totalDebt = person.currentDebt + Math.max(0, person.schoolCost - person.fundingOffset);

  return (
    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-900 text-sm">{person.name}</span>
              {hasSchool && (
                <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                  Going to school
                </span>
              )}
            </div>
            {totalDebt > 0 && (
              <p className="text-xs text-neutral-500 mt-0.5">
                Total projected debt: <span className="font-semibold text-neutral-700">${totalDebt.toLocaleString()}</span>
                {person.income > 0 && <> | Income: <span className="font-semibold text-neutral-700">${person.income.toLocaleString()}/yr</span></>}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-xs text-neutral-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              Remove
            </button>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`text-neutral-400 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 px-6 py-5 space-y-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-600">Name</label>
            <input
              type="text"
              value={person.name}
              onChange={(e) => set("name")(e.target.value)}
              className="w-full max-w-xs rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm py-2.5 px-3 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
              placeholder={`Person ${index + 1}`}
            />
          </div>

          {/* Current Debt */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Current Debt</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                label="Current Debt Balance"
                value={person.currentDebt}
                onChange={set("currentDebt") as (v: number) => void}
                prefix="$"
                step={1000}
                hint="Student loans, personal loans, credit cards, etc."
              />
              {hasDebt && (
                <SliderInput
                  label="Average Interest Rate"
                  value={person.debtRate}
                  onChange={set("debtRate") as (v: number) => void}
                  min={0}
                  max={25}
                  step={0.25}
                  format={fmtRate}
                />
              )}
            </div>
          </div>

          {/* Current Finances */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Current Finances</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                label="Annual Income"
                value={person.income}
                onChange={set("income") as (v: number) => void}
                prefix="$"
                suffix="/yr"
                step={5000}
              />
              <NumberInput
                label="Monthly Expenses"
                value={person.monthlyExpenses}
                onChange={set("monthlyExpenses") as (v: number) => void}
                prefix="$"
                suffix="/mo"
                step={100}
                hint="Rent, food, insurance, utilities, etc."
              />
            </div>
          </div>

          {/* School */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Graduate School</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                label="Total School Cost"
                value={person.schoolCost}
                onChange={set("schoolCost") as (v: number) => void}
                prefix="$"
                step={5000}
                hint="Full program cost (tuition + fees + living)"
              />
              {hasSchool && (
                <>
                  <SliderInput
                    label="Federal Loan Interest Rate"
                    value={person.schoolRate}
                    onChange={set("schoolRate") as (v: number) => void}
                    min={4}
                    max={10}
                    step={0.01}
                    format={fmtRate}
                    hint="Grad PLUS: ~8.05% | Direct Unsubsidized: ~6.54%"
                  />
                  <NumberInput
                    label="Expected Post-Grad Salary"
                    value={person.expectedPostGradSalary}
                    onChange={set("expectedPostGradSalary") as (v: number) => void}
                    prefix="$"
                    suffix="/yr"
                    step={5000}
                    hint="Expected annual salary after graduation"
                  />
                </>
              )}
            </div>
          </div>

          {/* Funding */}
          {hasSchool && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Funding & Debt Reduction</h4>
              <NumberInput
                label="Total Funding Offset"
                value={person.fundingOffset}
                onChange={set("fundingOffset") as (v: number) => void}
                prefix="$"
                step={1000}
                hint="Scholarships + grants + employer assistance + military programs + savings"
              />
              {person.fundingOffset > 0 && (
                <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-900">Net school debt: </span>
                    ${Math.max(0, person.schoolCost - person.fundingOffset).toLocaleString()}
                    <span className="text-neutral-400 ml-2">
                      ({Math.round((person.fundingOffset / person.schoolCost) * 100)}% covered)
                    </span>
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">Common funding sources</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-500">
                  <span>Institutional scholarships</span>
                  <span>Employer tuition assistance</span>
                  <span>Federal service programs</span>
                  <span>Military education benefits</span>
                  <span>State grants</span>
                  <span>Personal savings</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
