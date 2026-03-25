// ─── Core financial math ───────────────────────────────────────────────────

export interface Inputs {
  // Partner current debt
  partnerCurrentDebt: number;
  partnerCurrentRate: number; // %

  // New school debt
  schoolCost: number;
  schoolRate: number; // % (grad PLUS ~8.05% or Direct Unsubsidized ~6.54%)
  fundingOffset: number; // scholarships + grants + corporate / employer sponsorship

  // Partner expected salary after OD
  partnerSalary: number;

  // My income
  myIncome: number;

  // Waiting scenario: years to wait, savings per year
  waitYears: number;
  savingsPerYear: number;

  // Family / household
  householdExpenses: number; // monthly
}

export interface RepaymentResult {
  strategy: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  monthsToPayoff: number;
  yearsToPayoff: number;
  forgiven?: number;
  notes: string;
  pros: string[];
  cons: string[];
}

/** Monthly payment on a standard amortising loan */
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/** Total interest paid on a standard loan */
export function totalInterest(principal: number, annualRate: number, months: number): number {
  const pmt = monthlyPayment(principal, annualRate, months);
  return pmt * months - principal;
}

/** Balance after N months with minimum monthly payment */
export function balanceAfterMonths(
  principal: number,
  annualRate: number,
  monthlyPmt: number,
  months: number
): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.max(0, principal - monthlyPmt * months);
  return principal * Math.pow(1 + r, months) - monthlyPmt * ((Math.pow(1 + r, months) - 1) / r);
}

/** Months to pay off a loan at a given monthly payment */
export function monthsToPayoff(principal: number, annualRate: number, monthlyPmt: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(principal / monthlyPmt);
  if (monthlyPmt <= principal * r) return Infinity; // payment doesn't cover interest
  return Math.ceil(-Math.log(1 - (principal * r) / monthlyPmt) / Math.log(1 + r));
}

export function computeNetDebt(inputs: Inputs): number {
  return Math.max(0, inputs.schoolCost - inputs.fundingOffset) + inputs.partnerCurrentDebt;
}

export function computeNewSchoolDebt(inputs: Inputs): number {
  return Math.max(0, inputs.schoolCost - inputs.fundingOffset);
}

// ─── Repayment strategies ──────────────────────────────────────────────────

export function computeRepaymentStrategies(inputs: Inputs): RepaymentResult[] {
  const newDebt = computeNewSchoolDebt(inputs);
  const currentDebt = inputs.partnerCurrentDebt;
  const totalDebt = newDebt + currentDebt;

  // Blended rate (weighted average)
  const blendedRate =
    totalDebt > 0
      ? (newDebt * inputs.schoolRate + currentDebt * inputs.partnerCurrentRate) / totalDebt
      : 0;

  const schoolRate = inputs.schoolRate;
  const results: RepaymentResult[] = [];

  // 1. Standard 10-year
  if (totalDebt > 0) {
    const pmt = monthlyPayment(totalDebt, blendedRate, 120);
    const interest = pmt * 120 - totalDebt;
    results.push({
      strategy: "Standard 10-Year Repayment",
      monthlyPayment: pmt,
      totalPaid: pmt * 120,
      totalInterest: interest,
      monthsToPayoff: 120,
      yearsToPayoff: 10,
      notes:
        "Fixed monthly payments over 10 years. You pay the least interest of any plan. Requires the highest monthly payment.",
      pros: [
        "Lowest total interest paid",
        "Predictable fixed payment",
        "Debt-free in 10 years",
      ],
      cons: [
        "Highest monthly payment",
        "May strain budget during residency years",
      ],
    });
  }

  // 2. Extended 25-year
  if (totalDebt > 0) {
    const pmt = monthlyPayment(totalDebt, blendedRate, 300);
    const interest = pmt * 300 - totalDebt;
    results.push({
      strategy: "Extended 25-Year Repayment",
      monthlyPayment: pmt,
      totalPaid: pmt * 300,
      totalInterest: interest,
      monthsToPayoff: 300,
      yearsToPayoff: 25,
      notes:
        "Lower monthly payment but significantly more interest. Good if cash flow is tight after graduation.",
      pros: ["Lower monthly payment", "More cash flow flexibility"],
      cons: [
        "Pay significantly more interest overall",
        "Debt lingers into mid-career",
      ],
    });
  }

  // 3. SAVE / Income-Driven Repayment (IDR)
  if (newDebt > 0 && inputs.partnerSalary > 0) {
    // SAVE: discretionary income = AGI - 225% of federal poverty line (~$33,300 for 2 people)
    // Payment = 5% of discretionary income for undergrad, 10% for grad loans
    const povertyLine = 33300;
    const discretionary = Math.max(0, inputs.partnerSalary - povertyLine);
    const annualPayment = discretionary * 0.1;
    const monthlyPmt = annualPayment / 12;

    let totalPaid = 0;
    let balance = totalDebt;
    let months = 0;
    const r = blendedRate / 100 / 12;

    // simulate 300 months (25 year forgiveness on SAVE for grad)
    while (months < 300 && balance > 0) {
      const interestAccrued = balance * r;
      const effectivePmt = Math.max(monthlyPmt, 0);
      balance = balance + interestAccrued - effectivePmt;
      if (balance < 0) balance = 0;
      totalPaid += effectivePmt;
      months++;
    }

    const forgiven = Math.max(0, balance);

    results.push({
      strategy: "SAVE Plan (Income-Driven)",
      monthlyPayment: monthlyPmt,
      totalPaid: totalPaid,
      totalInterest: Math.max(0, totalPaid - totalDebt + forgiven),
      monthsToPayoff: months,
      yearsToPayoff: Math.round(months / 12),
      forgiven: forgiven > 1000 ? forgiven : undefined,
      notes:
        "SAVE (Saving on a Valuable Education) caps payments at ~10% of discretionary income. Remaining balance forgiven after 25 years (taxable event). Interest subsidy: if payment doesn't cover interest, the government covers the difference on SAVE.",
      pros: [
        "Lowest monthly payment during lean years",
        "Government covers excess interest accrual",
        "Possible forgiveness after 25 years",
      ],
      cons: [
        "Forgiven amount may be taxable",
        "Pay more total interest",
        "Requires annual income recertification",
        "Subject to program changes",
      ],
    });
  }

  // 4. PSLF (Public Service Loan Forgiveness)
  if (newDebt > 0 && inputs.partnerSalary > 0) {
    // Requires: federal direct loans, IDR plan, 120 qualifying payments (10 years)
    // at nonprofit/government employer. Tax-free forgiveness.
    const povertyLine = 33300;
    const discretionary = Math.max(0, inputs.partnerSalary - povertyLine);
    const monthlyPmt = (discretionary * 0.1) / 12;

    let totalPaid = 0;
    let balance = totalDebt;
    const r = blendedRate / 100 / 12;

    for (let m = 0; m < 120; m++) {
      const interestAccrued = balance * r;
      balance = balance + interestAccrued - monthlyPmt;
      if (balance < 0) balance = 0;
      totalPaid += monthlyPmt;
    }

    const forgiven = Math.max(0, balance);

    results.push({
      strategy: "PSLF (Public Service Loan Forgiveness)",
      monthlyPayment: monthlyPmt,
      totalPaid: totalPaid,
      totalInterest: totalPaid + forgiven - totalDebt,
      monthsToPayoff: 120,
      yearsToPayoff: 10,
      forgiven: forgiven,
      notes:
        "Work 10 years at a qualifying nonprofit (federally-qualified health center, VA, Indian Health Service) or government employer. Make 120 qualifying IDR payments. Remaining balance forgiven TAX-FREE. This is one of the most powerful tools for ODs in underserved settings.",
      pros: [
        "Tax-free forgiveness after 10 years",
        "Low monthly payment while qualifying",
        "Real path to large balance elimination",
      ],
      cons: [
        "Must work for qualifying employer — limits private practice",
        "Requires federal Direct Loans only",
        "10-year commitment",
        "PSLF has historically had high rejection rates (improve paperwork diligence)",
      ],
    });
  }

  // 5. Aggressive payoff (extra $500/mo)
  if (totalDebt > 0) {
    const basePmt = monthlyPayment(totalDebt, blendedRate, 120);
    const aggressivePmt = basePmt + 500;
    const m = monthsToPayoff(totalDebt, blendedRate, aggressivePmt);
    const safeM = isFinite(m) ? m : 360;
    results.push({
      strategy: "Aggressive Payoff (+$500/mo extra)",
      monthlyPayment: aggressivePmt,
      totalPaid: aggressivePmt * safeM,
      totalInterest: aggressivePmt * safeM - totalDebt,
      monthsToPayoff: safeM,
      yearsToPayoff: parseFloat((safeM / 12).toFixed(1)),
      notes:
        "Pay $500 more than the standard minimum each month. Significantly reduces total interest and time to payoff. Ideal once income stabilizes.",
      pros: [
        "Saves substantial interest",
        "Debt-free much faster than standard",
        "Psychological freedom of accelerated payoff",
      ],
      cons: [
        "Requires budget discipline",
        "Less cash available for investing, emergencies",
      ],
    });
  }

  // 6. Forbearance (interest-only for 2 years, then standard)
  if (totalDebt > 0) {
    const r = blendedRate / 100 / 12;
    const interestOnlyPmt = totalDebt * r;
    const balanceAfterForbearance = totalDebt; // principal unchanged, interest paid (not IDR, just forbearance math)
    // In true forbearance interest capitalizes — model that:
    const capitalizedBalance = totalDebt * Math.pow(1 + blendedRate / 100, 2); // 2 years capitalized interest
    const pmt = monthlyPayment(capitalizedBalance, blendedRate, 120);
    const interest = pmt * 120 - capitalizedBalance;
    results.push({
      strategy: "Forbearance (2 years) → Standard 10-Year",
      monthlyPayment: pmt,
      totalPaid: pmt * 120,
      totalInterest: capitalizedBalance - totalDebt + interest,
      monthsToPayoff: 120,
      yearsToPayoff: 10,
      notes:
        "Deferring payments during residency/startup phase. WARNING: interest capitalizes and is added to principal at the end of forbearance, increasing your balance and long-term cost significantly.",
      pros: [
        "Breathing room during low-income early career",
        "No required payments for 2 years",
      ],
      cons: [
        "Interest capitalizes — balance GROWS during forbearance",
        "Net cost is considerably higher than starting payments immediately",
        "Not recommended unless income is truly insufficient to cover any payment",
      ],
    });
  }

  return results;
}

// ─── Scenario: Wait & Save ─────────────────────────────────────────────────

export interface WaitScenario {
  savedAmount: number;
  reducedDebt: number;
  monthlyPaymentAfter: number;
  totalInterestAfter: number;
  opportunityCostDelay: number; // income not earned while waiting
  netBenefit: number;
}

export function computeWaitScenario(inputs: Inputs): WaitScenario {
  const savedAmount = inputs.savingsPerYear * inputs.waitYears;
  const reducedSchoolDebt = Math.max(0, computeNewSchoolDebt(inputs) - savedAmount);
  const reducedTotal = reducedSchoolDebt + inputs.partnerCurrentDebt;
  const blendedRate =
    reducedTotal > 0
      ? (reducedSchoolDebt * inputs.schoolRate +
          inputs.partnerCurrentDebt * inputs.partnerCurrentRate) /
        reducedTotal
      : 0;

  const pmt = monthlyPayment(reducedTotal, blendedRate, 120);
  const interest = totalInterest(reducedTotal, blendedRate, 120);

  // Opportunity cost: OD salary foregone while waiting
  const opportunityCost = inputs.partnerSalary * inputs.waitYears;

  // Benefit: interest saved vs not waiting
  const originalDebt = computeNewSchoolDebt(inputs) + inputs.partnerCurrentDebt;
  const originalBlended =
    originalDebt > 0
      ? (computeNewSchoolDebt(inputs) * inputs.schoolRate +
          inputs.partnerCurrentDebt * inputs.partnerCurrentRate) /
        originalDebt
      : 0;
  const originalInterest = totalInterest(originalDebt, originalBlended, 120);
  const interestSaved = originalInterest - interest;

  return {
    savedAmount,
    reducedDebt: reducedTotal,
    monthlyPaymentAfter: pmt,
    totalInterestAfter: interest,
    opportunityCostDelay: opportunityCost,
    netBenefit: interestSaved - opportunityCost,
  };
}

// ─── Verdict logic ─────────────────────────────────────────────────────────

export interface Verdict {
  score: "green" | "yellow" | "red";
  headline: string;
  summary: string;
  keyMetrics: { label: string; value: string; flag?: "good" | "warn" | "bad" }[];
}

export function computeVerdict(inputs: Inputs): Verdict {
  const totalDebt = computeNetDebt(inputs);
  const combinedIncome = inputs.myIncome + inputs.partnerSalary;
  const dti = combinedIncome > 0 ? totalDebt / combinedIncome : 999;
  const strategies = computeRepaymentStrategies(inputs);
  const standardPmt = strategies.find((s) => s.strategy.startsWith("Standard"))?.monthlyPayment ?? 0;
  const monthlyIncome = combinedIncome / 12;
  const paymentRatio = monthlyIncome > 0 ? standardPmt / monthlyIncome : 999;
  const loanToIncome = inputs.partnerSalary > 0 ? totalDebt / inputs.partnerSalary : 999;

  const keyMetrics = [
    {
      label: "Total Debt",
      value: fmt(totalDebt),
      flag:
        totalDebt < 150000 ? ("good" as const) : totalDebt < 250000 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Debt-to-Income Ratio",
      value: `${dti.toFixed(1)}x`,
      flag: dti < 2 ? ("good" as const) : dti < 3.5 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Loan-to-Partner-Income",
      value: `${loanToIncome.toFixed(1)}x`,
      flag:
        loanToIncome < 1.5 ? ("good" as const) : loanToIncome < 2.5 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Standard Monthly Payment",
      value: `${fmtPmt(standardPmt)}/mo`,
      flag:
        paymentRatio < 0.15 ? ("good" as const) : paymentRatio < 0.25 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Payment as % of Monthly Income",
      value: `${(paymentRatio * 100).toFixed(0)}%`,
      flag:
        paymentRatio < 0.15 ? ("good" as const) : paymentRatio < 0.25 ? ("warn" as const) : ("bad" as const),
    },
  ];

  let score: "green" | "yellow" | "red";
  let headline: string;
  let summary: string;

  if (inputs.partnerSalary === 0 || combinedIncome === 0) {
    score = "yellow";
    headline = "Enter salary estimates to get a verdict";
    summary =
      "Fill in your income and your partner's expected OD salary to receive a personalized financial assessment.";
  } else if (dti <= 2 && loanToIncome <= 1.5 && paymentRatio <= 0.15) {
    score = "green";
    headline = "Financially Viable — Manageable with Discipline";
    summary =
      "Based on your inputs, the debt load is within acceptable ranges relative to your combined income. With a structured repayment plan and consistent budgeting, this is a financially sound path.";
  } else if (dti <= 3.5 && loanToIncome <= 2.5 && paymentRatio <= 0.25) {
    score = "yellow";
    headline = "Proceed with Caution — Meaningful but Manageable Risk";
    summary =
      "The numbers are workable, but the debt-to-income ratio warrants careful planning. Securing scholarships, employer sponsorship, or aggressively paying down debt early will meaningfully improve the outcome. PSLF or IDR plans could also significantly reduce long-term burden.";
  } else {
    score = "red";
    headline = "High Risk — Significant Financial Pressure";
    summary =
      "At current figures, this debt load could create serious financial strain. Consider reducing the school cost through scholarships or aid, maximizing the funding offset, or exploring PSLF employment paths. A second look at salary expectations and household expenses is also warranted before committing.";
  }

  return { score, headline, summary, keyMetrics };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function fmtPmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
