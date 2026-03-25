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

// Amortisation chart data: balance over time for each repayment strategy
function buildChartData(inputs: Inputs) {
  const totalDebt = computeNetDebt(inputs);
  if (totalDebt === 0) return [];

  const blended =
    totalDebt > 0
      ? (computeNewSchoolDebt(inputs) * inputs.schoolRate +
          inputs.partnerCurrentDebt * inputs.partnerCurrentRate) /
        totalDebt
      : 0;

  const std10Pmt = monthlyPayment(totalDebt, blended, 120);
  const std25Pmt = monthlyPayment(totalDebt, blended, 300);

  const povertyLine = 33300;
  const discretionary = Math.max(0, inputs.partnerSalary - povertyLine);
  const idrPmt = (discretionary * 0.1) / 12;

  const aggressivePmt = std10Pmt + 500;

  const data: { year: number; standard: number; extended: number; idr: number; aggressive: number }[] = [];

  for (let year = 0; year <= 25; year++) {
    const months = year * 12;
    const std = Math.max(0, balanceAfterMonths(totalDebt, blended, std10Pmt, months));
    const ext = Math.max(0, balanceAfterMonths(totalDebt, blended, std25Pmt, months));
    const idr = Math.max(0, balanceAfterMonths(totalDebt, blended, idrPmt, months));
    const agg = Math.max(0, balanceAfterMonths(totalDebt, blended, aggressivePmt, months));
    data.push({ year, standard: std, extended: ext, idr, aggressive: agg });
  }
  return data;
}

const tabs = ["Calculator", "Repayment Plans", "Scenarios", "Context & Education"];

const verdictColors = {
  green: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: "✓",
  },
  yellow: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: "⚠",
  },
  red: {
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    icon: "✗",
  },
};

export default function Calculator() {
  const [tab, setTab] = useState(0);
  const [inputs, setInputs] = useState<Inputs>({
    partnerCurrentDebt: 0,
    partnerCurrentRate: 0,
    schoolCost: 0,
    schoolRate: 8.05,
    fundingOffset: 0,
    partnerSalary: 0,
    myIncome: 0,
    waitYears: 1,
    savingsPerYear: 0,
    householdExpenses: 0,
  });

  const set = (key: keyof Inputs) => (val: number) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const totalDebt = useMemo(() => computeNetDebt(inputs), [inputs]);
  const newSchoolDebt = useMemo(() => computeNewSchoolDebt(inputs), [inputs]);
  const strategies = useMemo(() => computeRepaymentStrategies(inputs), [inputs]);
  const waitScenario = useMemo(() => computeWaitScenario(inputs), [inputs]);
  const verdict = useMemo(() => computeVerdict(inputs), [inputs]);
  const chartData = useMemo(() => buildChartData(inputs), [inputs]);

  const vc = verdictColors[verdict.score];

  return (
    <div className="min-h-screen bg-[#eef0f3]">
      {/* Header */}
      <div className="border-b border-slate-300 bg-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-lg">
                🎓
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  OD School Financial Decision Tool
                </h1>
                <p className="text-xs text-slate-400">
                  Built for real decisions, not guesswork
                </p>
              </div>
            </div>
            {/* Live verdict pill */}
            <div
              className={`hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border ${vc.border} ${vc.bg}`}
            >
              <div className={`w-2 h-2 rounded-full ${vc.dot}`} />
              <span className={`text-xs font-semibold ${vc.text}`}>{verdict.headline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-300 bg-slate-100 sticky top-[73px] z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === i
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ═══════════════════════════════ TAB 0: CALCULATOR ═══════════════════════════ */}
        {tab === 0 && (
          <div className="space-y-6">
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
                    inputs.myIncome + inputs.partnerSalary > 0
                      ? ((strategies[0]?.monthlyPayment ?? 0) / ((inputs.myIncome + inputs.partnerSalary) / 12)) < 0.15
                        ? "good"
                        : ((strategies[0]?.monthlyPayment ?? 0) / ((inputs.myIncome + inputs.partnerSalary) / 12)) < 0.25
                        ? "warn"
                        : "bad"
                      : "neutral"
                  }
                />
                <MetricBadge
                  label="Net School Debt"
                  value={fmt(newSchoolDebt)}
                  flag={newSchoolDebt < 150000 ? "good" : newSchoolDebt < 220000 ? "warn" : "bad"}
                />
                <MetricBadge
                  label="Combined Income"
                  value={`${fmt(inputs.myIncome + inputs.partnerSalary)}/yr`}
                  flag={inputs.myIncome + inputs.partnerSalary > 0 ? "neutral" : "neutral"}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Partner existing debt */}
              <InputCard
                title="Partner's Current Debt"
                subtitle="Any existing loans she carries right now"
                icon="📌"
                accent="rose"
              >
                <NumberInput
                  label="Current Debt Balance"
                  value={inputs.partnerCurrentDebt}
                  onChange={set("partnerCurrentDebt")}
                  prefix="$"
                  step={1000}
                  hint="Undergrad loans, personal loans, credit cards, etc."
                />
                <SliderInput
                  label="Average Interest Rate"
                  value={inputs.partnerCurrentRate}
                  onChange={set("partnerCurrentRate")}
                  min={0}
                  max={15}
                  step={0.25}
                  format={fmtRate}
                  hint="Weighted average across all current debt"
                />
              </InputCard>

              {/* My income */}
              <InputCard
                title="Your Income (Debt-Free)"
                subtitle="Your current annual income — supports household while she's in school"
                icon="💼"
                accent="emerald"
              >
                <NumberInput
                  label="Your Annual Income"
                  value={inputs.myIncome}
                  onChange={set("myIncome")}
                  prefix="$"
                  suffix="/yr"
                  step={5000}
                  hint="Used to calculate combined DTI and household budget"
                />
                <NumberInput
                  label="Monthly Household Expenses"
                  value={inputs.householdExpenses}
                  onChange={set("householdExpenses")}
                  prefix="$"
                  suffix="/mo"
                  step={100}
                  hint="Rent, food, utilities, insurance, etc."
                />
                {inputs.myIncome > 0 && inputs.householdExpenses > 0 && (
                  <div className="rounded-lg bg-slate-100 border border-slate-300 p-3 space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-medium text-slate-700">Monthly surplus (your income only):</span>{" "}
                      <span
                        className={
                          inputs.myIncome / 12 - inputs.householdExpenses > 0
                            ? "text-emerald-400 font-semibold"
                            : "text-rose-400 font-semibold"
                        }
                      >
                        {fmt(inputs.myIncome / 12 - inputs.householdExpenses)}/mo
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      This is what&apos;s left each month for saving, loan payments, and everything else while
                      she&apos;s in school.
                    </p>
                  </div>
                )}
              </InputCard>

              {/* School Cost */}
              <InputCard
                title="Optometry School Cost"
                subtitle="Total 4-year program cost before any aid or funding"
                icon="🏫"
                accent="amber"
              >
                <NumberInput
                  label="Total School Cost (4 years)"
                  value={inputs.schoolCost}
                  onChange={set("schoolCost")}
                  prefix="$"
                  step={5000}
                  hint="Tuition + fees + estimated living costs. Average OD school total: $180k–$250k."
                />
                <SliderInput
                  label="Federal Loan Interest Rate"
                  value={inputs.schoolRate}
                  onChange={set("schoolRate")}
                  min={4}
                  max={10}
                  step={0.01}
                  format={fmtRate}
                  hint="Grad PLUS: ~8.05% | Direct Unsubsidized (grad): ~6.54% | Check current rates at studentaid.gov"
                />
              </InputCard>

              {/* Funding Offsets */}
              <InputCard
                title="Funding & Debt Reduction"
                subtitle="Anything that reduces how much you need to borrow"
                icon="🎯"
                accent="sky"
              >
                <NumberInput
                  label="Total Funding Offset"
                  value={inputs.fundingOffset}
                  onChange={set("fundingOffset")}
                  prefix="$"
                  step={1000}
                  hint="Add up: scholarships + grants + employer/corporate sponsorship + military HPSP + family contribution + savings"
                />
                {inputs.fundingOffset > 0 && inputs.schoolCost > 0 && (
                  <div className="rounded-lg bg-sky-50 border border-sky-200 p-3">
                    <p className="text-xs text-sky-700">
                      <span className="font-semibold">Net school debt after offsets: </span>
                      {fmt(Math.max(0, inputs.schoolCost - inputs.fundingOffset))}
                      <span className="text-sky-400/60 ml-2">
                        ({Math.round((inputs.fundingOffset / inputs.schoolCost) * 100)}% covered)
                      </span>
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Sources: school scholarships, employer tuition reimbursement, IHS/NHSC programs,
                  military HPSP, state grants, personal savings applied upfront.
                </p>
              </InputCard>

              {/* Partner salary */}
              <InputCard
                title="Expected OD Salary"
                subtitle="Her estimated annual salary after graduation"
                icon="📈"
                accent="emerald"
              >
                <NumberInput
                  label="Partner's Expected Annual Salary"
                  value={inputs.partnerSalary}
                  onChange={set("partnerSalary")}
                  prefix="$"
                  suffix="/yr"
                  step={5000}
                  hint="OD range: $110k–$160k employed, $150k–$250k+ in ownership. Use conservative estimate."
                />
                {inputs.partnerSalary > 0 && totalDebt > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Loan-to-income ratio:</span>
                      <span
                        className={
                          totalDebt / inputs.partnerSalary < 1.5
                            ? "text-emerald-400 font-semibold"
                            : totalDebt / inputs.partnerSalary < 2.5
                            ? "text-amber-400 font-semibold"
                            : "text-rose-400 font-semibold"
                        }
                      >
                        {(totalDebt / inputs.partnerSalary).toFixed(2)}x
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          totalDebt / inputs.partnerSalary < 1.5
                            ? "bg-emerald-500"
                            : totalDebt / inputs.partnerSalary < 2.5
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, (totalDebt / inputs.partnerSalary / 3) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Benchmark: &lt; 1.5x = comfortable, &lt; 2.5x = workable, &gt; 2.5x = challenging</p>
                  </div>
                )}
              </InputCard>
            </div>

            {/* Verdict */}
            {(inputs.partnerSalary > 0 || totalDebt > 0) && (
              <div className={`rounded-xl border ${vc.border} ${vc.bg} p-5`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border ${vc.border} ${vc.bg} flex items-center justify-center text-xl flex-shrink-0`}
                  >
                    {vc.icon}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className={`font-semibold text-base ${vc.text}`}>{verdict.headline}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{verdict.summary}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {verdict.keyMetrics.map((m) => (
                    <MetricBadge key={m.label} label={m.label} value={m.value} flag={m.flag} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════ TAB 1: REPAYMENT PLANS ═══════════════════════ */}
        {tab === 1 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-1">Repayment Strategy Comparison</h2>
              <p className="text-sm text-slate-500">
                All plans are based on your current inputs. Click any plan to expand its details, pros, and cons.
                Total debt: <span className="text-indigo-600 font-semibold">{fmt(totalDebt)}</span>
              </p>
            </div>

            {totalDebt === 0 ? (
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-slate-400">Enter debt and salary figures on the Calculator tab to see repayment plans.</p>
              </div>
            ) : (
              <>
                {/* Amortisation chart */}
                {chartData.length > 0 && (
                  <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm p-5">
                    <h3 className="font-semibold text-slate-900 mb-1">Balance Over Time</h3>
                    <p className="text-xs text-slate-400 mb-4">How each strategy reduces your balance year by year</p>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          {[
                            { id: "std", color: "#6366f1" },
                            { id: "ext", color: "#f59e0b" },
                            { id: "idr", color: "#0ea5e9" },
                            { id: "agg", color: "#10b981" },
                          ].map(({ id, color }) => (
                            <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                              <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickFormatter={(v) => `Yr ${v}`}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          labelStyle={{ color: "#64748b" }}
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
                          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
                        />
                        <Area type="monotone" dataKey="standard" stroke="#6366f1" fill="url(#grad-std)" strokeWidth={2} />
                        <Area type="monotone" dataKey="extended" stroke="#f59e0b" fill="url(#grad-ext)" strokeWidth={2} />
                        <Area type="monotone" dataKey="idr" stroke="#0ea5e9" fill="url(#grad-idr)" strokeWidth={2} />
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

                {/* Side-by-side comparison table */}
                <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-200 bg-slate-100">
                    <h3 className="font-semibold text-slate-800">Quick Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          <th className="text-left text-xs text-slate-500 font-medium px-4 py-2.5">Strategy</th>
                          <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5">Monthly</th>
                          <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5">Total Paid</th>
                          <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5">Interest</th>
                          <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5">Years</th>
                          <th className="text-right text-xs text-slate-500 font-medium px-4 py-2.5">Forgiven</th>
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map((s, i) => (
                          <tr key={i} className="border-b border-slate-200 hover:bg-slate-100">
                            <td className="px-4 py-2.5 text-slate-700 font-medium max-w-[180px]">
                              <span className="truncate block">{s.strategy}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-900 font-semibold tabular-nums">
                              {fmt(s.monthlyPayment)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">
                              {fmt(s.totalPaid)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-rose-600 tabular-nums">
                              {fmt(s.totalInterest)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">
                              {s.yearsToPayoff}
                            </td>
                            <td className="px-4 py-2.5 text-right text-emerald-600 tabular-nums">
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

        {/* ═══════════════════════════════ TAB 2: SCENARIOS ═══════════════════════════ */}
        {tab === 2 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-1">Decision Scenarios</h2>
              <p className="text-sm text-slate-500">
                Compare the &quot;go now&quot; path against waiting to save, and see a full household budget breakdown.
              </p>
            </div>

            {/* Wait scenario inputs */}
            <InputCard
              title="Waiting Scenario"
              subtitle="What if you waited 1–3 years and saved first?"
              icon="⏱"
              accent="sky"
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
                  hint="How many years before starting school"
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

            {/* Wait scenario results */}
            {inputs.schoolCost > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Go Now */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="font-semibold text-slate-800">Start Now</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Total Debt", value: fmt(totalDebt) },
                      {
                        label: "Std 10yr Monthly",
                        value: `${fmt(strategies[0]?.monthlyPayment ?? 0)}/mo`,
                      },
                      { label: "Total Interest (10yr)", value: fmt(strategies[0]?.totalInterest ?? 0) },
                      {
                        label: "OD Income Starts",
                        value: `Year 4 (+ residency)`,
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="text-slate-800 font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wait scenario */}
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <h3 className="font-semibold text-slate-800">
                      Wait {inputs.waitYears} Year{inputs.waitYears > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Saved Before School", value: fmt(waitScenario.savedAmount) },
                      { label: "Reduced Total Debt", value: fmt(waitScenario.reducedDebt) },
                      {
                        label: "New Monthly Payment",
                        value: `${fmt(waitScenario.monthlyPaymentAfter)}/mo`,
                      },
                      {
                        label: "Interest Saved vs Now",
                        value: fmt(
                          Math.max(0, (strategies[0]?.totalInterest ?? 0) - waitScenario.totalInterestAfter)
                        ),
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="text-slate-800 font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Opportunity cost analysis */}
            {inputs.partnerSalary > 0 && inputs.waitYears > 0 && (
              <div
                className={`rounded-xl border p-5 ${
                  waitScenario.netBenefit > 0
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-rose-500/30 bg-rose-500/5"
                }`}
              >
                <h3 className="font-semibold text-slate-800 mb-3">Opportunity Cost Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">OD salary foregone while waiting ({inputs.waitYears} yr{inputs.waitYears > 1 ? "s" : ""}):</span>
                    <span className="text-rose-600 font-semibold">{fmt(waitScenario.opportunityCostDelay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Interest saved by borrowing less:</span>
                    <span className="text-emerald-600 font-semibold">
                      {fmt(Math.max(0, (strategies[0]?.totalInterest ?? 0) - waitScenario.totalInterestAfter))}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-slate-700 font-semibold">Net financial impact of waiting:</span>
                    <span
                      className={`font-bold text-base ${
                        waitScenario.netBenefit > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {waitScenario.netBenefit > 0 ? "+" : ""}
                      {fmt(waitScenario.netBenefit)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {waitScenario.netBenefit < 0
                    ? "Starting now is financially better. The salary you'd earn as an OD during the waiting period far exceeds the interest savings from borrowing less."
                    : "Waiting generates a net financial benefit — though this must be weighed against career timing, personal readiness, and the cost of delaying career launch."}
                </p>
              </div>
            )}

            {/* Budget in school */}
            {inputs.myIncome > 0 && inputs.householdExpenses > 0 && (
              <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Household Budget During School</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Your income carries the household. This shows whether that&apos;s feasible.
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Your monthly income",
                      value: inputs.myIncome / 12,
                      color: "text-emerald-600",
                      isPositive: true,
                    },
                    {
                      label: "Household expenses",
                      value: -inputs.householdExpenses,
                      color: "text-rose-600",
                      isPositive: false,
                    },
                    {
                      label: "Monthly surplus / deficit",
                      value: inputs.myIncome / 12 - inputs.householdExpenses,
                      color:
                        inputs.myIncome / 12 - inputs.householdExpenses >= 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      isPositive: inputs.myIncome / 12 - inputs.householdExpenses >= 0,
                      bold: true,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className={`flex justify-between text-sm ${row.bold ? "border-t border-slate-200 pt-2 font-semibold" : ""}`}
                    >
                      <span className="text-slate-500">{row.label}</span>
                      <span className={row.color}>{fmt(Math.abs(row.value))}/mo</span>
                    </div>
                  ))}
                </div>
                {inputs.myIncome / 12 < inputs.householdExpenses && (
                  <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3">
                    <p className="text-xs text-rose-700">
                      ⚠ Your income alone doesn&apos;t fully cover current household expenses.
                      You&apos;ll need to reduce expenses, supplement with her part-time work, or draw on savings during school.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Funding offset scenarios */}
            {inputs.schoolCost > 0 && (
              <div className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-1">Funding Offset Impact</h3>
                <p className="text-xs text-slate-400 mb-4">
                  How much does each additional $10k of scholarships/grants/sponsorship save you over a 10-year loan?
                </p>
                <div className="space-y-2">
                  {[0, 10000, 20000, 30000, 50000, 75000, 100000].map((offset) => {
                    const netDebt = Math.max(0, inputs.schoolCost - offset) + inputs.partnerCurrentDebt;
                    const pmt = monthlyPayment(netDebt, inputs.schoolRate, 120);
                    const interest = pmt * 120 - netDebt;
                    const isCurrentOffset =
                      Math.abs(offset - inputs.fundingOffset) < 5001;
                    return (
                      <div
                        key={offset}
                        className={`flex justify-between items-center text-xs rounded-lg px-3 py-2 ${
                          isCurrentOffset
                            ? "bg-indigo-50 border border-indigo-200 text-indigo-900"
                            : "bg-slate-100 border border-slate-200 text-slate-600"
                        }`}
                      >
                        <span className="font-medium">
                          {fmt(offset)} offset{isCurrentOffset ? " ← current" : ""}
                        </span>
                        <span>Debt: {fmt(netDebt)}</span>
                        <span>Payment: {fmt(pmt)}/mo</span>
                        <span className="text-rose-400">Interest: {fmt(interest)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════ TAB 3: CONTEXT ═══════════════════════════════ */}
        {tab === 3 && <ContextPage />}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-300 mt-8 bg-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <p className="text-xs text-slate-400 text-center">
            For educational purposes only — not financial advice. Consult a licensed financial advisor
            before making major financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
