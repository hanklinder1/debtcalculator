"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import PersonCard from "./PersonCard";
import InputCard from "./InputCard";
import NumberInput from "./NumberInput";
import SliderInput from "./SliderInput";
import MetricBadge from "./MetricBadge";
import RepaymentCard from "./RepaymentCard";
import SuggestedPath from "./SuggestedPath";
import ContextPage from "./ContextPage";
import {
  AppInputs,
  PersonInputs,
  createDefaultPerson,
  totalCombinedDebt,
  totalExistingDebt,
  totalNewSchoolDebt,
  totalPostGradIncome,
  totalMonthlyExpenses,
  duringSchoolIncome,
  blendedRate,
  computeRepaymentStrategies,
  computeWaitScenario,
  computeVerdict,
  computeSuggestedPath,
  fmt,
  monthlyPayment,
  balanceAfterMonths,
} from "@/lib/finance";
import { exportToPDF, exportToExcel } from "@/lib/export";

const fmtUSD = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function buildChartData(inputs: AppInputs) {
  const debt = totalCombinedDebt(inputs);
  if (debt === 0) return [];
  const rate = blendedRate(inputs);

  const std10 = monthlyPayment(debt, rate, 120);
  const std25 = monthlyPayment(debt, rate, 300);
  const postGrad = totalPostGradIncome(inputs);
  const povertyLine = 33300;
  const idrPmt = Math.max(0, postGrad - povertyLine) * 0.1 / 12;
  const aggressive = std10 + 500;

  const data: { year: number; standard: number; extended: number; idr: number; aggressive: number }[] = [];
  for (let year = 0; year <= 25; year++) {
    const m = year * 12;
    data.push({
      year,
      standard: Math.max(0, balanceAfterMonths(debt, rate, std10, m)),
      extended: Math.max(0, balanceAfterMonths(debt, rate, std25, m)),
      idr: Math.max(0, balanceAfterMonths(debt, rate, idrPmt, m)),
      aggressive: Math.max(0, balanceAfterMonths(debt, rate, aggressive, m)),
    });
  }
  return data;
}

const tabs = ["Calculator", "Repayment Plans", "Suggested Path", "Scenarios", "Learn More"];

const verdictColors = {
  green: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  yellow: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  red: { border: "border-red-200", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function Calculator() {
  const [tab, setTab] = useState(0);
  const [inputs, setInputs] = useState<AppInputs>({
    persons: [createDefaultPerson(0)],
    waitYears: 1,
    savingsPerYear: 0,
  });

  const addPerson = () => {
    if (inputs.persons.length >= 5) return;
    setInputs((prev) => ({
      ...prev,
      persons: [...prev.persons, createDefaultPerson(prev.persons.length)],
    }));
  };

  const removePerson = (index: number) => {
    setInputs((prev) => ({
      ...prev,
      persons: prev.persons.filter((_, i) => i !== index),
    }));
  };

  const updatePerson = (index: number, updated: PersonInputs) => {
    setInputs((prev) => ({
      ...prev,
      persons: prev.persons.map((p, i) => (i === index ? updated : p)),
    }));
  };

  const setWait = (key: "waitYears" | "savingsPerYear") => (val: number) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const debt = useMemo(() => totalCombinedDebt(inputs), [inputs]);
  const existing = useMemo(() => totalExistingDebt(inputs), [inputs]);
  const schoolDebt = useMemo(() => totalNewSchoolDebt(inputs), [inputs]);
  const postGrad = useMemo(() => totalPostGradIncome(inputs), [inputs]);
  const expenses = useMemo(() => totalMonthlyExpenses(inputs), [inputs]);
  const schoolIncome = useMemo(() => duringSchoolIncome(inputs), [inputs]);
  const strategies = useMemo(() => computeRepaymentStrategies(inputs), [inputs]);
  const waitScenario = useMemo(() => computeWaitScenario(inputs), [inputs]);
  const verdict = useMemo(() => computeVerdict(inputs), [inputs]);
  const suggestedPath = useMemo(() => computeSuggestedPath(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);

  const vc = verdictColors[verdict.score];
  const hasSchoolPeople = inputs.persons.some((p) => p.schoolCost > 0);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Financial Planner</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Enter your numbers. See your options.</p>
          </div>
          <div className="flex items-center gap-3">
            {debt > 0 && (
              <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border ${vc.border} ${vc.bg}`}>
                <div className={`w-2 h-2 rounded-full ${vc.dot}`} />
                <span className={`text-xs font-semibold ${vc.text}`}>{verdict.headline}</span>
              </div>
            )}
            {debt > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => exportToPDF(inputs)}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 hover:border-neutral-400 transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportToExcel(inputs)}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-lg px-3 py-2 hover:border-neutral-400 transition-colors"
                >
                  Export Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white sticky top-[73px] z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === i
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ═══════════════════ TAB 0: CALCULATOR ═══════════════════ */}
        {tab === 0 && (
          <div className="space-y-6">
            {/* Summary metrics */}
            {debt > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricBadge
                  label="Total Debt"
                  value={fmt(debt)}
                  flag={debt < 150000 ? "good" : debt < 300000 ? "warn" : "bad"}
                />
                <MetricBadge
                  label="Monthly Payment (Std)"
                  value={`${fmt(strategies[0]?.monthlyPayment ?? 0)}/mo`}
                  flag={
                    postGrad > 0
                      ? ((strategies[0]?.monthlyPayment ?? 0) / (postGrad / 12)) < 0.15 ? "good"
                        : ((strategies[0]?.monthlyPayment ?? 0) / (postGrad / 12)) < 0.25 ? "warn" : "bad"
                      : "neutral"
                  }
                />
                <MetricBadge
                  label="Existing Debt"
                  value={fmt(existing)}
                  flag={existing === 0 ? "good" : existing < 50000 ? "warn" : "bad"}
                />
                <MetricBadge
                  label="Post-Grad Income"
                  value={`${fmt(postGrad)}/yr`}
                  flag={postGrad > 0 ? "neutral" : "neutral"}
                />
              </div>
            )}

            {/* Person cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">People</h3>
                <span className="text-xs text-neutral-400">{inputs.persons.length} of 5</span>
              </div>
              {inputs.persons.map((person, i) => (
                <PersonCard
                  key={i}
                  person={person}
                  index={i}
                  canRemove={inputs.persons.length > 1}
                  onChange={(updated) => updatePerson(i, updated)}
                  onRemove={() => removePerson(i)}
                />
              ))}
              {inputs.persons.length < 5 && (
                <button
                  onClick={addPerson}
                  className="w-full border border-dashed border-neutral-300 rounded-xl py-4 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                >
                  + Add Person
                </button>
              )}
            </div>

            {/* Budget during school */}
            {hasSchoolPeople && schoolIncome > 0 && expenses > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                  Household Budget During School
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Household income during school</span>
                    <span className="text-neutral-900 font-medium">{fmt(schoolIncome / 12)}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Combined monthly expenses</span>
                    <span className="text-neutral-900 font-medium">{fmt(expenses)}/mo</span>
                  </div>
                  <div className="border-t border-neutral-100 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-neutral-700">Monthly surplus / deficit</span>
                    <span className={schoolIncome / 12 - expenses >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {schoolIncome / 12 - expenses >= 0 ? "+" : ""}{fmt(schoolIncome / 12 - expenses)}/mo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Loan-to-income ratio */}
            {postGrad > 0 && debt > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Debt-to-Income Ratio</h4>
                  <span className={`text-sm font-bold tabular-nums ${
                    debt / postGrad < 1.5 ? "text-emerald-600" : debt / postGrad < 2.5 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {(debt / postGrad).toFixed(2)}x
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      debt / postGrad < 1.5 ? "bg-emerald-500" : debt / postGrad < 2.5 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (debt / postGrad / 4) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Comfortable (&lt;1.5x)</span>
                  <span>Workable (&lt;2.5x)</span>
                  <span>Challenging (&gt;2.5x)</span>
                </div>
              </div>
            )}

            {/* Verdict */}
            {(postGrad > 0 || debt > 0) && (
              <div className={`rounded-xl border ${vc.border} ${vc.bg} p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full ${vc.dot} mt-1 flex-shrink-0`} />
                  <div className="space-y-1 flex-1">
                    <p className={`font-semibold text-base ${vc.text}`}>{verdict.headline}</p>
                    <p className="text-sm text-neutral-600 leading-relaxed">{verdict.summary}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {verdict.keyMetrics.map((m) => (
                    <MetricBadge key={m.label} label={m.label} value={m.value} flag={m.flag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ TAB 1: REPAYMENT PLANS ═══════════════════ */}
        {tab === 1 && (
          <div className="space-y-6">
            <div className="border border-neutral-200 rounded-xl bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-1">Repayment Strategy Comparison</h2>
              <p className="text-sm text-neutral-500">
                Common ways to pay down debt.
                {debt > 0 && <> Total debt: <span className="text-neutral-900 font-semibold">{fmt(debt)}</span></>}
              </p>
            </div>

            {debt === 0 ? (
              <div className="border border-neutral-200 rounded-xl bg-white p-12 text-center">
                <p className="text-neutral-400">Enter debt and income figures on the Calculator tab to see repayment plans.</p>
              </div>
            ) : (
              <>
                {chartData.length > 0 && (
                  <div className="border border-neutral-200 rounded-xl bg-white p-6">
                    <h3 className="font-semibold text-neutral-900 mb-1">Balance Over Time</h3>
                    <p className="text-xs text-neutral-500 mb-6">How each strategy reduces your balance year by year</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          {[
                            { id: "std", color: "#111" },
                            { id: "ext", color: "#a3a3a3" },
                            { id: "idr", color: "#737373" },
                            { id: "agg", color: "#10b981" },
                          ].map(({ id, color }) => (
                            <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                              <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis dataKey="year" tick={{ fill: "#a3a3a3", fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
                        <YAxis tick={{ fill: "#a3a3a3", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                          labelStyle={{ color: "#737373" }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(v: any, name: any) => [
                            fmtUSD(typeof v === "number" ? v : 0),
                            name === "standard" ? "Standard 10yr" : name === "extended" ? "Extended 25yr" : name === "idr" ? "IDR" : "Aggressive",
                          ]}
                          labelFormatter={(y) => `Year ${y}`}
                        />
                        <Legend
                          formatter={(v) => v === "standard" ? "Standard 10yr" : v === "extended" ? "Extended 25yr" : v === "idr" ? "IDR" : "Aggressive (+$500)"}
                          wrapperStyle={{ fontSize: 12, color: "#737373" }}
                        />
                        <Area type="monotone" dataKey="standard" stroke="#111" fill="url(#grad-std)" strokeWidth={2} />
                        <Area type="monotone" dataKey="extended" stroke="#a3a3a3" fill="url(#grad-ext)" strokeWidth={1.5} />
                        <Area type="monotone" dataKey="idr" stroke="#737373" fill="url(#grad-idr)" strokeWidth={1.5} strokeDasharray="4 4" />
                        <Area type="monotone" dataKey="aggressive" stroke="#10b981" fill="url(#grad-agg)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-3">
                  {strategies.map((s, i) => (
                    <RepaymentCard key={i} {...s} highlighted={i === 0} />
                  ))}
                </div>

                {/* Comparison table */}
                <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 text-sm">Quick Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-100">
                          <th className="text-left text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Strategy</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Monthly</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Total Paid</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Interest</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Years</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-500 font-medium px-6 py-3">Forgiven</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map((s, i) => (
                          <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-3 text-neutral-700 font-medium max-w-[200px]">
                              <span className="truncate block text-xs">{s.strategy}</span>
                            </td>
                            <td className="px-6 py-3 text-right text-neutral-900 font-semibold tabular-nums text-xs">{fmt(s.monthlyPayment)}</td>
                            <td className="px-6 py-3 text-right text-neutral-500 tabular-nums text-xs">{fmt(s.totalPaid)}</td>
                            <td className="px-6 py-3 text-right text-red-600 tabular-nums text-xs">{fmt(s.totalInterest)}</td>
                            <td className="px-6 py-3 text-right text-neutral-500 tabular-nums text-xs">{s.yearsToPayoff}</td>
                            <td className="px-6 py-3 text-right text-emerald-600 tabular-nums text-xs">
                              {s.forgiven !== undefined && s.forgiven > 1000 ? fmt(s.forgiven) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════ TAB 2: SUGGESTED PATH ═══════════════════ */}
        {tab === 2 && <SuggestedPath steps={suggestedPath} />}

        {/* ═══════════════════ TAB 3: SCENARIOS ═══════════════════ */}
        {tab === 3 && (
          <div className="space-y-6">
            <div className="border border-neutral-200 rounded-xl bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-1">Decision Scenarios</h2>
              <p className="text-sm text-neutral-500">Compare starting school now vs. waiting to save.</p>
            </div>

            <InputCard title="Waiting Scenario" subtitle="What if you waited and saved first?">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SliderInput
                  label="Years to Wait"
                  value={inputs.waitYears}
                  onChange={setWait("waitYears")}
                  min={1}
                  max={5}
                  step={1}
                  format={(v) => `${v} yr${v > 1 ? "s" : ""}`}
                />
                <NumberInput
                  label="Annual Savings During Wait"
                  value={inputs.savingsPerYear}
                  onChange={setWait("savingsPerYear")}
                  prefix="$"
                  suffix="/yr"
                  step={1000}
                  hint="How much you'd save per year toward school costs"
                />
              </div>
            </InputCard>

            {schoolDebt > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-900 rounded-xl bg-white p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                    <h3 className="font-semibold text-neutral-900 text-sm">Start Now</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Total Debt", value: fmt(debt) },
                      { label: "Std 10yr Monthly", value: `${fmt(strategies[0]?.monthlyPayment ?? 0)}/mo` },
                      { label: "Total Interest (10yr)", value: fmt(strategies[0]?.totalInterest ?? 0) },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-neutral-400">{row.label}</span>
                        <span className="text-neutral-900 font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl bg-white p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      Wait {inputs.waitYears} Year{inputs.waitYears > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Saved Before School", value: fmt(waitScenario.savedAmount) },
                      { label: "Reduced Total Debt", value: fmt(waitScenario.reducedDebt) },
                      { label: "New Monthly Payment", value: `${fmt(waitScenario.monthlyPaymentAfter)}/mo` },
                      { label: "Interest Saved", value: fmt(Math.max(0, (strategies[0]?.totalInterest ?? 0) - waitScenario.totalInterestAfter)) },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-neutral-400">{row.label}</span>
                        <span className="text-neutral-900 font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {postGrad > 0 && inputs.waitYears > 0 && (
              <div className={`rounded-xl border p-6 ${
                waitScenario.netBenefit > 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
              }`}>
                <h3 className="font-semibold text-neutral-900 text-sm mb-4">Opportunity Cost Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Salary foregone while waiting</span>
                    <span className="text-red-600 font-semibold">{fmt(waitScenario.opportunityCostDelay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Interest saved by borrowing less</span>
                    <span className="text-emerald-600 font-semibold">
                      {fmt(Math.max(0, (strategies[0]?.totalInterest ?? 0) - waitScenario.totalInterestAfter))}
                    </span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 flex justify-between">
                    <span className="text-neutral-700 font-semibold">Net financial impact</span>
                    <span className={`font-bold text-base ${waitScenario.netBenefit > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {waitScenario.netBenefit > 0 ? "+" : ""}{fmt(waitScenario.netBenefit)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                  {waitScenario.netBenefit < 0
                    ? "Starting now is financially better. The income earned during the waiting period far exceeds the interest savings from borrowing less."
                    : "Waiting generates a net benefit — though weigh this against career timing and personal readiness."}
                </p>
              </div>
            )}

            {/* Funding offset impact */}
            {schoolDebt > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-6">
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Funding Offset Impact</h3>
                <p className="text-xs text-neutral-500 mb-4">Each additional $10k of scholarships/grants saves over a 10-year loan:</p>
                <div className="space-y-2">
                  {[0, 10000, 20000, 30000, 50000, 75000, 100000].map((offset) => {
                    const netDebt = Math.max(0, totalNewSchoolDebt(inputs) - offset + existing);
                    const rate = blendedRate(inputs);
                    const pmt = monthlyPayment(netDebt, rate, 120);
                    const interest = pmt * 120 - netDebt;
                    const currentOffset = inputs.persons.reduce((s, p) => s + p.fundingOffset, 0);
                    const isCurrent = Math.abs(offset - currentOffset) < 5001;
                    return (
                      <div key={offset} className={`flex justify-between items-center text-xs rounded-lg px-4 py-2.5 ${
                        isCurrent ? "bg-neutral-900 text-white" : "bg-neutral-50 border border-neutral-100 text-neutral-600"
                      }`}>
                        <span className="font-medium">{fmt(offset)} offset{isCurrent ? " (current)" : ""}</span>
                        <span>Debt: {fmt(netDebt)}</span>
                        <span>Payment: {fmt(pmt)}/mo</span>
                        <span className={isCurrent ? "text-red-300" : "text-red-500"}>Interest: {fmt(interest)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ TAB 4: LEARN MORE ═══════════════════ */}
        {tab === 4 && <ContextPage />}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 mt-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className="text-xs text-neutral-400 text-center">
            For educational purposes only — not financial advice. Consult a licensed financial advisor before making major financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
