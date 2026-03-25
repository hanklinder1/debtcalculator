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
import InputCard from "./InputCard";
import NumberInput from "./NumberInput";
import SliderInput from "./SliderInput";
import MetricBadge from "./MetricBadge";
import RepaymentCard from "./RepaymentCard";
import ContextPage from "./ContextPage";
import {
  Inputs,
  computeNetDebt,
  computeNewSchoolDebt,
  computeExistingDebt,
  computeHouseholdExpenses,
  computeBlendedRate,
  computeRepaymentStrategies,
  computeWaitScenario,
  computeVerdict,
  fmt,
  monthlyPayment,
  balanceAfterMonths,
} from "@/lib/finance";

const fmtUSD = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const fmtRate = (v: number) => `${v.toFixed(2)}%`;

function buildChartData(inputs: Inputs) {
  const totalDebt = computeNetDebt(inputs);
  if (totalDebt === 0) return [];
  const blended = computeBlendedRate(inputs);

  const std10Pmt = monthlyPayment(totalDebt, blended, 120);
  const std25Pmt = monthlyPayment(totalDebt, blended, 300);

  const povertyLine = 33300;
  const discretionary = Math.max(0, inputs.expectedPostGradSalary - povertyLine);
  const idrPmt = (discretionary * 0.1) / 12;

  const aggressivePmt = std10Pmt + 500;

  const data: { year: number; standard: number; extended: number; idr: number; aggressive: number }[] = [];

  for (let year = 0; year <= 25; year++) {
    const months = year * 12;
    data.push({
      year,
      standard: Math.max(0, balanceAfterMonths(totalDebt, blended, std10Pmt, months)),
      extended: Math.max(0, balanceAfterMonths(totalDebt, blended, std25Pmt, months)),
      idr: Math.max(0, balanceAfterMonths(totalDebt, blended, idrPmt, months)),
      aggressive: Math.max(0, balanceAfterMonths(totalDebt, blended, aggressivePmt, months)),
    });
  }
  return data;
}

const tabs = ["Calculator", "Repayment Plans", "Scenarios", "Learn More"];

const verdictColors = {
  green: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  yellow: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function Calculator() {
  const [tab, setTab] = useState(0);
  const [inputs, setInputs] = useState<Inputs>({
    person1CurrentDebt: 0,
    person1DebtRate: 0,
    person1Income: 0,
    person1MonthlyExpenses: 0,
    person2CurrentDebt: 0,
    person2DebtRate: 0,
    person2Income: 0,
    person2MonthlyExpenses: 0,
    schoolCost: 0,
    schoolRate: 8.05,
    fundingOffset: 0,
    expectedPostGradSalary: 0,
    waitYears: 1,
    savingsPerYear: 0,
  });

  const set = (key: keyof Inputs) => (val: number) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const totalDebt = useMemo(() => computeNetDebt(inputs), [inputs]);
  const newSchoolDebt = useMemo(() => computeNewSchoolDebt(inputs), [inputs]);
  const existingDebt = useMemo(() => computeExistingDebt(inputs), [inputs]);
  const householdExpenses = useMemo(() => computeHouseholdExpenses(inputs), [inputs]);
  const strategies = useMemo(() => computeRepaymentStrategies(inputs), [inputs]);
  const waitScenario = useMemo(() => computeWaitScenario(inputs), [inputs]);
  const verdict = useMemo(() => computeVerdict(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);

  const vc = verdictColors[verdict.score];
  const combinedIncome = inputs.person2Income + inputs.expectedPostGradSalary;
  const duringSchoolIncome = inputs.person2Income;

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Section Header */}
      <div className="border-b border-neutral-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Financial Planner</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Enter your numbers. See your options.</p>
          </div>
          {/* Verdict pill */}
          {totalDebt > 0 && (
            <div className={`hidden sm:flex items-center gap-2 rounded-full px-4 py-2 border ${vc.border} ${vc.bg}`}>
              <div className={`w-2 h-2 rounded-full ${vc.dot}`} />
              <span className={`text-xs font-semibold ${vc.text}`}>{verdict.headline}</span>
            </div>
          )}
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
          <div className="space-y-8">
            {/* Quick summary bar */}
            {totalDebt > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricBadge
                  label="Total Debt"
                  value={fmt(totalDebt)}
                  flag={totalDebt < 150000 ? "good" : totalDebt < 250000 ? "warn" : "bad"}
                />
                <MetricBadge
                  label="Monthly Payment (Std)"
                  value={`${fmt(strategies[0]?.monthlyPayment ?? 0)}/mo`}
                  flag={
                    combinedIncome > 0
                      ? ((strategies[0]?.monthlyPayment ?? 0) / (combinedIncome / 12)) < 0.15
                        ? "good"
                        : ((strategies[0]?.monthlyPayment ?? 0) / (combinedIncome / 12)) < 0.25
                        ? "warn"
                        : "bad"
                      : "neutral"
                  }
                />
                <MetricBadge
                  label="Existing Debt"
                  value={fmt(existingDebt)}
                  flag={existingDebt === 0 ? "good" : existingDebt < 50000 ? "warn" : "bad"}
                />
                <MetricBadge
                  label="Combined Post-Grad Income"
                  value={`${fmt(combinedIncome)}/yr`}
                  flag={combinedIncome > 0 ? "neutral" : "neutral"}
                />
              </div>
            )}

            {/* Person sections */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Person 1 — The Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCard
                  title="Current Debt"
                  subtitle="Existing loans, credit cards, or other debt"
                >
                  <NumberInput
                    label="Current Debt Balance"
                    value={inputs.person1CurrentDebt}
                    onChange={set("person1CurrentDebt")}
                    prefix="$"
                    step={1000}
                    hint="Undergrad loans, personal loans, credit cards, etc."
                  />
                  <SliderInput
                    label="Average Interest Rate"
                    value={inputs.person1DebtRate}
                    onChange={set("person1DebtRate")}
                    min={0}
                    max={25}
                    step={0.25}
                    format={fmtRate}
                  />
                </InputCard>

                <InputCard
                  title="Current Finances"
                  subtitle="Income and expenses before starting school"
                >
                  <NumberInput
                    label="Current Annual Income"
                    value={inputs.person1Income}
                    onChange={set("person1Income")}
                    prefix="$"
                    suffix="/yr"
                    step={5000}
                    hint="This income stops during school"
                  />
                  <NumberInput
                    label="Monthly Expenses"
                    value={inputs.person1MonthlyExpenses}
                    onChange={set("person1MonthlyExpenses")}
                    prefix="$"
                    suffix="/mo"
                    step={100}
                    hint="Personal share of rent, food, insurance, etc."
                  />
                </InputCard>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Person 2 — The Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCard
                  title="Current Debt"
                  subtitle="Existing loans or other debt carried by partner"
                >
                  <NumberInput
                    label="Current Debt Balance"
                    value={inputs.person2CurrentDebt}
                    onChange={set("person2CurrentDebt")}
                    prefix="$"
                    step={1000}
                  />
                  <SliderInput
                    label="Average Interest Rate"
                    value={inputs.person2DebtRate}
                    onChange={set("person2DebtRate")}
                    min={0}
                    max={25}
                    step={0.25}
                    format={fmtRate}
                  />
                </InputCard>

                <InputCard
                  title="Current Finances"
                  subtitle="Income that supports the household during school"
                >
                  <NumberInput
                    label="Current Annual Income"
                    value={inputs.person2Income}
                    onChange={set("person2Income")}
                    prefix="$"
                    suffix="/yr"
                    step={5000}
                    hint="Primary household income while partner is in school"
                  />
                  <NumberInput
                    label="Monthly Expenses"
                    value={inputs.person2MonthlyExpenses}
                    onChange={set("person2MonthlyExpenses")}
                    prefix="$"
                    suffix="/mo"
                    step={100}
                    hint="Personal share of rent, food, insurance, etc."
                  />
                </InputCard>
              </div>
            </div>

            {/* Household budget snapshot during school */}
            {duringSchoolIncome > 0 && householdExpenses > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                  Household Budget During School
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Partner&apos;s monthly income</span>
                    <span className="text-neutral-900 font-medium">{fmt(duringSchoolIncome / 12)}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Combined monthly expenses</span>
                    <span className="text-neutral-900 font-medium">{fmt(householdExpenses)}/mo</span>
                  </div>
                  <div className="border-t border-neutral-100 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-neutral-700">Monthly surplus / deficit</span>
                    <span className={duringSchoolIncome / 12 - householdExpenses >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {duringSchoolIncome / 12 - householdExpenses >= 0 ? "+" : ""}{fmt(duringSchoolIncome / 12 - householdExpenses)}/mo
                    </span>
                  </div>
                </div>
                {duringSchoolIncome / 12 < householdExpenses && (
                  <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs text-red-700">
                      Income doesn&apos;t cover expenses during school. You&apos;ll need to reduce costs, supplement with part-time work, or draw on savings.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Optometry School</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputCard
                  title="Cost of School"
                  subtitle="Total 4-year program cost before any aid"
                >
                  <NumberInput
                    label="Total School Cost (4 years)"
                    value={inputs.schoolCost}
                    onChange={set("schoolCost")}
                    prefix="$"
                    step={5000}
                    hint="Tuition + fees + estimated living costs. Average OD school: $180k-$250k."
                  />
                  <SliderInput
                    label="Federal Loan Interest Rate"
                    value={inputs.schoolRate}
                    onChange={set("schoolRate")}
                    min={4}
                    max={10}
                    step={0.01}
                    format={fmtRate}
                    hint="Grad PLUS: ~8.05% | Direct Unsubsidized: ~6.54%"
                  />
                  <NumberInput
                    label="Expected Post-Grad Salary"
                    value={inputs.expectedPostGradSalary}
                    onChange={set("expectedPostGradSalary")}
                    prefix="$"
                    suffix="/yr"
                    step={5000}
                    hint="OD range: $110k-$160k employed, $150k-$250k+ ownership"
                  />
                </InputCard>

                <InputCard
                  title="Funding & Debt Reduction"
                  subtitle="Anything that reduces how much you need to borrow"
                >
                  <NumberInput
                    label="Total Funding Offset"
                    value={inputs.fundingOffset}
                    onChange={set("fundingOffset")}
                    prefix="$"
                    step={1000}
                    hint="Scholarships + grants + employer sponsorship + military HPSP + savings"
                  />
                  {inputs.fundingOffset > 0 && inputs.schoolCost > 0 && (
                    <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3">
                      <p className="text-xs text-neutral-600">
                        <span className="font-semibold text-neutral-900">Net school debt after offsets: </span>
                        {fmt(Math.max(0, inputs.schoolCost - inputs.fundingOffset))}
                        <span className="text-neutral-400 ml-2">
                          ({Math.round((inputs.fundingOffset / inputs.schoolCost) * 100)}% covered)
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-3 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Sources to explore</p>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-neutral-500">
                      <span>School scholarships</span>
                      <span>Employer tuition assistance</span>
                      <span>IHS / NHSC programs</span>
                      <span>Military HPSP</span>
                      <span>State grants</span>
                      <span>Personal savings</span>
                    </div>
                  </div>
                </InputCard>
              </div>
            </div>

            {/* Loan-to-income ratio */}
            {inputs.expectedPostGradSalary > 0 && totalDebt > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Loan-to-Income Ratio</h4>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      totalDebt / inputs.expectedPostGradSalary < 1.5
                        ? "text-emerald-600"
                        : totalDebt / inputs.expectedPostGradSalary < 2.5
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {(totalDebt / inputs.expectedPostGradSalary).toFixed(2)}x
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      totalDebt / inputs.expectedPostGradSalary < 1.5
                        ? "bg-emerald-500"
                        : totalDebt / inputs.expectedPostGradSalary < 2.5
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (totalDebt / inputs.expectedPostGradSalary / 3) * 100)}%` }}
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
            {(inputs.expectedPostGradSalary > 0 || totalDebt > 0) && (
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
                Based on your inputs. Click any plan to expand details.
                {totalDebt > 0 && (
                  <> Total debt: <span className="text-neutral-900 font-semibold">{fmt(totalDebt)}</span></>
                )}
              </p>
            </div>

            {totalDebt === 0 ? (
              <div className="border border-neutral-200 rounded-xl bg-white p-12 text-center">
                <p className="text-neutral-400">Enter debt and salary figures on the Calculator tab to see repayment plans.</p>
              </div>
            ) : (
              <>
                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="border border-neutral-200 rounded-xl bg-white p-6">
                    <h3 className="font-semibold text-neutral-900 mb-1">Balance Over Time</h3>
                    <p className="text-xs text-neutral-400 mb-6">How each strategy reduces your balance year by year</p>
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
                        <XAxis
                          dataKey="year"
                          tick={{ fill: "#a3a3a3", fontSize: 11 }}
                          tickFormatter={(v) => `Yr ${v}`}
                        />
                        <YAxis
                          tick={{ fill: "#a3a3a3", fontSize: 11 }}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                          labelStyle={{ color: "#737373" }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(v: any, name: any) => [
                            fmtUSD(typeof v === "number" ? v : 0),
                            name === "standard" ? "Standard 10yr" :
                            name === "extended" ? "Extended 25yr" :
                            name === "idr" ? "IDR/SAVE" : "Aggressive",
                          ]}
                          labelFormatter={(y) => `Year ${y}`}
                        />
                        <Legend
                          formatter={(v) =>
                            v === "standard" ? "Standard 10yr" :
                            v === "extended" ? "Extended 25yr" :
                            v === "idr" ? "IDR/SAVE" : "Aggressive (+$500)"
                          }
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

                {/* Strategy cards */}
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
                          <th className="text-left text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Strategy</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Monthly</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Total Paid</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Interest</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Years</th>
                          <th className="text-right text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-6 py-3">Forgiven</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map((s, i) => (
                          <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-3 text-neutral-700 font-medium max-w-[200px]">
                              <span className="truncate block text-xs">{s.strategy}</span>
                            </td>
                            <td className="px-6 py-3 text-right text-neutral-900 font-semibold tabular-nums text-xs">
                              {fmt(s.monthlyPayment)}
                            </td>
                            <td className="px-6 py-3 text-right text-neutral-500 tabular-nums text-xs">
                              {fmt(s.totalPaid)}
                            </td>
                            <td className="px-6 py-3 text-right text-red-600 tabular-nums text-xs">
                              {fmt(s.totalInterest)}
                            </td>
                            <td className="px-6 py-3 text-right text-neutral-500 tabular-nums text-xs">
                              {s.yearsToPayoff}
                            </td>
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

        {/* ═══════════════════ TAB 2: SCENARIOS ═══════════════════ */}
        {tab === 2 && (
          <div className="space-y-6">
            <div className="border border-neutral-200 rounded-xl bg-white p-6">
              <h2 className="font-semibold text-neutral-900 mb-1">Decision Scenarios</h2>
              <p className="text-sm text-neutral-500">
                Compare starting now vs. waiting to save, and see full budget breakdowns.
              </p>
            </div>

            {/* Wait scenario inputs */}
            <InputCard
              title="Waiting Scenario"
              subtitle="What if you waited and saved first?"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SliderInput
                  label="Years to Wait"
                  value={inputs.waitYears}
                  onChange={set("waitYears")}
                  min={1}
                  max={5}
                  step={1}
                  format={(v) => `${v} yr${v > 1 ? "s" : ""}`}
                />
                <NumberInput
                  label="Annual Savings During Wait"
                  value={inputs.savingsPerYear}
                  onChange={set("savingsPerYear")}
                  prefix="$"
                  suffix="/yr"
                  step={1000}
                  hint="How much you'd save per year toward school costs"
                />
              </div>
            </InputCard>

            {/* Start Now vs Wait */}
            {inputs.schoolCost > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-neutral-900 rounded-xl bg-white p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                    <h3 className="font-semibold text-neutral-900 text-sm">Start Now</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Total Debt", value: fmt(totalDebt) },
                      { label: "Std 10yr Monthly", value: `${fmt(strategies[0]?.monthlyPayment ?? 0)}/mo` },
                      { label: "Total Interest (10yr)", value: fmt(strategies[0]?.totalInterest ?? 0) },
                      { label: "Income Starts", value: "Year 4 (+ residency)" },
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

            {/* Opportunity cost */}
            {inputs.expectedPostGradSalary > 0 && inputs.waitYears > 0 && (
              <div
                className={`rounded-xl border p-6 ${
                  waitScenario.netBenefit > 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <h3 className="font-semibold text-neutral-900 text-sm mb-4">Opportunity Cost Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Salary foregone while waiting ({inputs.waitYears} yr{inputs.waitYears > 1 ? "s" : ""})</span>
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
                    ? "Starting now is financially better. The salary earned as an OD during the waiting period far exceeds the interest savings from borrowing less."
                    : "Waiting generates a net benefit — though weigh this against career timing, personal readiness, and the cost of delaying career launch."}
                </p>
              </div>
            )}

            {/* Funding offset impact */}
            {inputs.schoolCost > 0 && (
              <div className="border border-neutral-200 rounded-xl bg-white p-6">
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Funding Offset Impact</h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Each additional $10k of scholarships/grants saves you over a 10-year loan:
                </p>
                <div className="space-y-2">
                  {[0, 10000, 20000, 30000, 50000, 75000, 100000].map((offset) => {
                    const netDebt = Math.max(0, inputs.schoolCost - offset) + existingDebt;
                    const pmt = monthlyPayment(netDebt, inputs.schoolRate, 120);
                    const interest = pmt * 120 - netDebt;
                    const isCurrentOffset = Math.abs(offset - inputs.fundingOffset) < 5001;
                    return (
                      <div
                        key={offset}
                        className={`flex justify-between items-center text-xs rounded-lg px-4 py-2.5 ${
                          isCurrentOffset
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-50 border border-neutral-100 text-neutral-600"
                        }`}
                      >
                        <span className="font-medium">
                          {fmt(offset)} offset{isCurrentOffset ? " (current)" : ""}
                        </span>
                        <span>Debt: {fmt(netDebt)}</span>
                        <span>Payment: {fmt(pmt)}/mo</span>
                        <span className={isCurrentOffset ? "text-red-300" : "text-red-500"}>
                          Interest: {fmt(interest)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ TAB 3: CONTEXT ═══════════════════ */}
        {tab === 3 && <ContextPage />}
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
