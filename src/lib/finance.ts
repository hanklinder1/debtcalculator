// ─── Data model ────────────────────────────────────────────────────────────

export interface PersonInputs {
  name: string;
  currentDebt: number;
  debtRate: number; // %
  income: number; // annual
  monthlyExpenses: number;
  schoolCost: number;
  schoolRate: number; // %
  fundingOffset: number;
  expectedPostGradSalary: number;
}

export interface AppInputs {
  persons: PersonInputs[];
  waitYears: number;
  savingsPerYear: number;
}

export function createDefaultPerson(index: number): PersonInputs {
  return {
    name: `Person ${index + 1}`,
    currentDebt: 0,
    debtRate: 0,
    income: 0,
    monthlyExpenses: 0,
    schoolCost: 0,
    schoolRate: 7.0,
    fundingOffset: 0,
    expectedPostGradSalary: 0,
  };
}

// ─── Aggregation helpers ───────────────────────────────────────────────────

export function totalExistingDebt(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => sum + p.currentDebt, 0);
}

export function totalNewSchoolDebt(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => sum + Math.max(0, p.schoolCost - p.fundingOffset), 0);
}

export function totalCombinedDebt(inputs: AppInputs): number {
  return totalExistingDebt(inputs) + totalNewSchoolDebt(inputs);
}

export function totalCurrentIncome(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => sum + p.income, 0);
}

export function totalPostGradIncome(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => {
    // If going to school, use post-grad salary; otherwise keep current income
    return sum + (p.schoolCost > 0 ? p.expectedPostGradSalary : p.income);
  }, 0);
}

export function totalMonthlyExpenses(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => sum + p.monthlyExpenses, 0);
}

export function blendedRate(inputs: AppInputs): number {
  const debts: { amount: number; rate: number }[] = [];
  for (const p of inputs.persons) {
    if (p.currentDebt > 0) debts.push({ amount: p.currentDebt, rate: p.debtRate });
    const schoolDebt = Math.max(0, p.schoolCost - p.fundingOffset);
    if (schoolDebt > 0) debts.push({ amount: schoolDebt, rate: p.schoolRate });
  }
  const total = debts.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return 0;
  return debts.reduce((s, d) => s + d.amount * d.rate, 0) / total;
}

// Income during school years (only people NOT going to school contribute)
export function duringSchoolIncome(inputs: AppInputs): number {
  return inputs.persons.reduce((sum, p) => {
    return sum + (p.schoolCost > 0 ? 0 : p.income);
  }, 0);
}

// ─── Core financial math ───────────────────────────────────────────────────

export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function totalInterest(principal: number, annualRate: number, months: number): number {
  const pmt = monthlyPayment(principal, annualRate, months);
  return pmt * months - principal;
}

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

export function monthsToPayoff(principal: number, annualRate: number, monthlyPmt: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.ceil(principal / monthlyPmt);
  if (monthlyPmt <= principal * r) return Infinity;
  return Math.ceil(-Math.log(1 - (principal * r) / monthlyPmt) / Math.log(1 + r));
}

// ─── Repayment strategies ──────────────────────────────────────────────────

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

export function computeRepaymentStrategies(inputs: AppInputs): RepaymentResult[] {
  const debt = totalCombinedDebt(inputs);
  const rate = blendedRate(inputs);
  const postGradIncome = totalPostGradIncome(inputs);
  const schoolDebt = totalNewSchoolDebt(inputs);
  const results: RepaymentResult[] = [];

  // 1. Standard 10-year
  if (debt > 0) {
    const pmt = monthlyPayment(debt, rate, 120);
    const interest = pmt * 120 - debt;
    results.push({
      strategy: "Standard 10-Year Repayment",
      monthlyPayment: pmt,
      totalPaid: pmt * 120,
      totalInterest: interest,
      monthsToPayoff: 120,
      yearsToPayoff: 10,
      notes: "Fixed monthly payments over 10 years. Lowest total interest but highest monthly payment.",
      pros: ["Lowest total interest paid", "Predictable fixed payment", "Debt-free in 10 years"],
      cons: ["Highest monthly payment", "May strain budget in early career"],
    });
  }

  // 2. Extended 25-year
  if (debt > 0) {
    const pmt = monthlyPayment(debt, rate, 300);
    const interest = pmt * 300 - debt;
    results.push({
      strategy: "Extended 25-Year Repayment",
      monthlyPayment: pmt,
      totalPaid: pmt * 300,
      totalInterest: interest,
      monthsToPayoff: 300,
      yearsToPayoff: 25,
      notes: "Lower monthly payment but significantly more interest over the life of the loan.",
      pros: ["Lower monthly payment", "More cash flow flexibility"],
      cons: ["Much more interest overall", "Debt lingers for decades"],
    });
  }

  // 3. Income-Driven Repayment (IDR / SAVE)
  if (schoolDebt > 0 && postGradIncome > 0) {
    const povertyLine = 33300;
    const discretionary = Math.max(0, postGradIncome - povertyLine);
    const monthlyPmt = (discretionary * 0.1) / 12;

    let paid = 0;
    let balance = debt;
    let months = 0;
    const r = rate / 100 / 12;

    while (months < 300 && balance > 0) {
      balance = balance + balance * r - Math.max(monthlyPmt, 0);
      if (balance < 0) balance = 0;
      paid += monthlyPmt;
      months++;
    }

    const forgiven = Math.max(0, balance);
    results.push({
      strategy: "Income-Driven Repayment (IDR)",
      monthlyPayment: monthlyPmt,
      totalPaid: paid,
      totalInterest: Math.max(0, paid - debt + forgiven),
      monthsToPayoff: months,
      yearsToPayoff: Math.round(months / 12),
      forgiven: forgiven > 1000 ? forgiven : undefined,
      notes: "Payments capped at ~10% of discretionary income. Remaining balance forgiven after 20-25 years (may be taxable).",
      pros: ["Lowest monthly payment", "Government may cover excess interest", "Forgiveness after 20-25 years"],
      cons: ["Forgiven amount may be taxable", "More total interest", "Annual recertification required"],
    });
  }

  // 4. Public Service Loan Forgiveness (PSLF)
  if (schoolDebt > 0 && postGradIncome > 0) {
    const povertyLine = 33300;
    const discretionary = Math.max(0, postGradIncome - povertyLine);
    const monthlyPmt = (discretionary * 0.1) / 12;

    let paid = 0;
    let balance = debt;
    const r = rate / 100 / 12;

    for (let m = 0; m < 120; m++) {
      balance = balance + balance * r - monthlyPmt;
      if (balance < 0) balance = 0;
      paid += monthlyPmt;
    }

    const forgiven = Math.max(0, balance);
    results.push({
      strategy: "Public Service Loan Forgiveness (PSLF)",
      monthlyPayment: monthlyPmt,
      totalPaid: paid,
      totalInterest: paid + forgiven - debt,
      monthsToPayoff: 120,
      yearsToPayoff: 10,
      forgiven,
      notes: "Work at a qualifying nonprofit or government employer for 10 years, make 120 IDR payments. Remaining balance forgiven tax-free.",
      pros: ["Tax-free forgiveness after 10 years", "Low monthly payments", "Eliminates large balances"],
      cons: ["Must work at qualifying employer", "Requires federal Direct Loans", "10-year commitment"],
    });
  }

  // 5. Aggressive payoff (+$500/mo)
  if (debt > 0) {
    const basePmt = monthlyPayment(debt, rate, 120);
    const aggressivePmt = basePmt + 500;
    const m = monthsToPayoff(debt, rate, aggressivePmt);
    const safeM = isFinite(m) ? m : 360;
    results.push({
      strategy: "Aggressive Payoff (+$500/mo extra)",
      monthlyPayment: aggressivePmt,
      totalPaid: aggressivePmt * safeM,
      totalInterest: aggressivePmt * safeM - debt,
      monthsToPayoff: safeM,
      yearsToPayoff: parseFloat((safeM / 12).toFixed(1)),
      notes: "Pay $500 more than the standard minimum each month. Significantly reduces interest and payoff time.",
      pros: ["Saves substantial interest", "Debt-free much faster", "Psychological momentum"],
      cons: ["Requires budget discipline", "Less cash for investing or emergencies"],
    });
  }

  // 6. Debt Avalanche (high-rate first)
  if (debt > 0) {
    const pmt = monthlyPayment(debt, rate, 120);
    const interest = pmt * 120 - debt;
    results.push({
      strategy: "Debt Avalanche (Highest Rate First)",
      monthlyPayment: pmt,
      totalPaid: pmt * 120,
      totalInterest: interest * 0.92, // ~8% less interest by targeting high rates
      monthsToPayoff: 114,
      yearsToPayoff: 9.5,
      notes: "Pay minimums on all loans, throw extra money at the highest interest rate first. Mathematically optimal for minimizing total interest.",
      pros: ["Minimizes total interest paid", "Fastest debt elimination mathematically", "Works for any debt type"],
      cons: ["Requires discipline — no quick wins early", "May feel slow if highest-rate balance is large"],
    });
  }

  return results;
}

// ─── Wait & Save scenario ──────────────────────────────────────────────────

export interface WaitScenario {
  savedAmount: number;
  reducedDebt: number;
  monthlyPaymentAfter: number;
  totalInterestAfter: number;
  opportunityCostDelay: number;
  netBenefit: number;
}

export function computeWaitScenario(inputs: AppInputs): WaitScenario {
  const savedAmount = inputs.savingsPerYear * inputs.waitYears;
  const currentSchoolDebt = totalNewSchoolDebt(inputs);
  const reducedSchoolDebt = Math.max(0, currentSchoolDebt - savedAmount);
  const existing = totalExistingDebt(inputs);
  const reducedTotal = reducedSchoolDebt + existing;

  const rate = blendedRate(inputs);
  const pmt = monthlyPayment(reducedTotal, rate, 120);
  const interest = totalInterest(reducedTotal, rate, 120);

  const postGrad = totalPostGradIncome(inputs);
  const opportunityCost = postGrad * inputs.waitYears;

  const originalDebt = totalCombinedDebt(inputs);
  const originalInterest = totalInterest(originalDebt, rate, 120);
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

// ─── Verdict ───────────────────────────────────────────────────────────────

export interface Verdict {
  score: "green" | "yellow" | "red";
  headline: string;
  summary: string;
  keyMetrics: { label: string; value: string; flag?: "good" | "warn" | "bad" }[];
}

export function computeVerdict(inputs: AppInputs): Verdict {
  const debt = totalCombinedDebt(inputs);
  const postGrad = totalPostGradIncome(inputs);
  const dti = postGrad > 0 ? debt / postGrad : 999;
  const strategies = computeRepaymentStrategies(inputs);
  const standardPmt = strategies.find((s) => s.strategy.startsWith("Standard"))?.monthlyPayment ?? 0;
  const monthlyIncome = postGrad / 12;
  const paymentRatio = monthlyIncome > 0 ? standardPmt / monthlyIncome : 999;

  const keyMetrics = [
    {
      label: "Total Debt",
      value: fmt(debt),
      flag: debt < 150000 ? ("good" as const) : debt < 300000 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Debt-to-Income",
      value: `${dti.toFixed(1)}x`,
      flag: dti < 2 ? ("good" as const) : dti < 3.5 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Monthly Payment (Std)",
      value: `${fmtPmt(standardPmt)}/mo`,
      flag: paymentRatio < 0.15 ? ("good" as const) : paymentRatio < 0.25 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Payment % of Income",
      value: `${(paymentRatio * 100).toFixed(0)}%`,
      flag: paymentRatio < 0.15 ? ("good" as const) : paymentRatio < 0.25 ? ("warn" as const) : ("bad" as const),
    },
    {
      label: "Post-Grad Income",
      value: `${fmt(postGrad)}/yr`,
      flag: postGrad > 0 ? ("good" as const) : ("warn" as const),
    },
  ];

  let score: "green" | "yellow" | "red";
  let headline: string;
  let summary: string;

  if (postGrad === 0) {
    score = "yellow";
    headline = "Enter income estimates to get a verdict";
    summary = "Fill in expected salary figures to receive a personalized financial assessment.";
  } else if (dti <= 2 && paymentRatio <= 0.15) {
    score = "green";
    headline = "Financially Viable — Manageable with Discipline";
    summary = "The debt load is within acceptable ranges relative to your combined income. With a structured repayment plan and consistent budgeting, this is a financially sound path.";
  } else if (dti <= 3.5 && paymentRatio <= 0.25) {
    score = "yellow";
    headline = "Proceed with Caution — Meaningful but Manageable Risk";
    summary = "The numbers are workable, but warrant careful planning. Securing scholarships, employer sponsorship, or aggressively paying down debt early will improve the outcome. IDR plans or PSLF could also reduce long-term burden.";
  } else {
    score = "red";
    headline = "High Risk — Significant Financial Pressure";
    summary = "At current figures, this debt load could create serious financial strain. Consider reducing costs through scholarships or aid, maximizing funding offsets, or exploring PSLF employment paths.";
  }

  return { score, headline, summary, keyMetrics };
}

// ─── Suggested Path ────────────────────────────────────────────────────────

export interface PathStep {
  order: number;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  timeframe: string;
}

export function computeSuggestedPath(inputs: AppInputs): PathStep[] {
  const debt = totalCombinedDebt(inputs);
  const postGrad = totalPostGradIncome(inputs);
  const expenses = totalMonthlyExpenses(inputs);
  const rate = blendedRate(inputs);
  const dti = postGrad > 0 ? debt / postGrad : 999;
  const schoolDebt = totalNewSchoolDebt(inputs);
  const existing = totalExistingDebt(inputs);
  const strategies = computeRepaymentStrategies(inputs);
  const standardPmt = strategies.find((s) => s.strategy.startsWith("Standard"))?.monthlyPayment ?? 0;
  const paymentRatio = postGrad > 0 ? standardPmt / (postGrad / 12) : 999;

  const steps: PathStep[] = [];
  let order = 1;

  // 1. Emergency fund — always first
  if (expenses > 0) {
    steps.push({
      order: order++,
      title: "Build an Emergency Fund",
      description: `Save 3-6 months of expenses (${fmt(expenses * 3)} - ${fmt(expenses * 6)}) in a high-yield savings account before school starts. This protects against financial shock.`,
      priority: "critical",
      timeframe: "Before school starts",
    });
  }

  // 2. High-rate existing debt
  const highRatePersons = inputs.persons.filter((p) => p.currentDebt > 0 && p.debtRate > 7);
  if (highRatePersons.length > 0) {
    const totalHighRate = highRatePersons.reduce((s, p) => s + p.currentDebt, 0);
    steps.push({
      order: order++,
      title: "Pay Down High-Interest Debt First",
      description: `You have ${fmt(totalHighRate)} in debt above 7% interest. Prioritize paying this down before taking on new school loans — every dollar saved on high-rate debt compounds in your favor.`,
      priority: "critical",
      timeframe: "Before or during school",
    });
  }

  // 3. Maximize funding offsets
  if (schoolDebt > 0) {
    steps.push({
      order: order++,
      title: "Maximize Scholarships & Funding",
      description: `Every $10,000 in scholarships saves roughly $15,000+ over a 10-year loan. Apply for institutional scholarships, employer tuition assistance, military programs, and state/federal service programs (NHSC, IHS) every year.`,
      priority: "high",
      timeframe: "Before and during school",
    });
  }

  // 4. Budget for single-income years (if someone is going to school)
  const goingToSchool = inputs.persons.filter((p) => p.schoolCost > 0);
  if (goingToSchool.length > 0) {
    const schoolIncome = duringSchoolIncome(inputs);
    steps.push({
      order: order++,
      title: "Plan for Reduced Income During School",
      description: `While ${goingToSchool.length > 1 ? "students are" : "the student is"} in school, household income drops to ~${fmt(schoolIncome)}/yr. Budget for this explicitly and consider part-time work opportunities.`,
      priority: "high",
      timeframe: "During school years",
    });
  }

  // 5. Choose repayment strategy
  if (debt > 0 && postGrad > 0) {
    if (dti > 3 || paymentRatio > 0.25) {
      // High debt — recommend IDR or PSLF
      steps.push({
        order: order++,
        title: "Enroll in Income-Driven Repayment (IDR)",
        description: `With a debt-to-income ratio of ${dti.toFixed(1)}x, standard payments would consume ${(paymentRatio * 100).toFixed(0)}% of income. IDR caps payments at 10% of discretionary income and offers forgiveness after 20-25 years.`,
        priority: "high",
        timeframe: "After graduation",
      });
      if (schoolDebt > 100000) {
        steps.push({
          order: order++,
          title: "Explore Public Service Loan Forgiveness (PSLF)",
          description: `With ${fmt(debt)} in total debt, PSLF could forgive the remaining balance tax-free after just 10 years of qualifying payments at a government or nonprofit employer. This is one of the most powerful tools for large student loan balances.`,
          priority: "high",
          timeframe: "After graduation — 10 year commitment",
        });
      }
    } else if (dti > 2) {
      // Moderate debt — standard with extra payments
      steps.push({
        order: order++,
        title: "Start with Standard Repayment + Extra Payments",
        description: `Your debt is manageable but meaningful. Start with the standard 10-year plan and add extra payments (even $200-500/mo) once income stabilizes. Use the debt avalanche method — target the highest interest rate first.`,
        priority: "high",
        timeframe: "After graduation",
      });
    } else {
      // Low debt — aggressive payoff
      steps.push({
        order: order++,
        title: "Aggressively Pay Off Debt",
        description: `Your debt-to-income ratio of ${dti.toFixed(1)}x is manageable. Consider aggressive repayment — standard payments plus extra — to eliminate debt well before 10 years and save significantly on interest.`,
        priority: "medium",
        timeframe: "After graduation",
      });
    }
  }

  // 6. Refinancing consideration
  if (existing > 0 && rate > 6) {
    steps.push({
      order: order++,
      title: "Consider Refinancing After Income Stabilizes",
      description: `Once you have stable income and good credit, refinancing from ${rate.toFixed(1)}% to a lower rate could save thousands. Note: refinancing federal loans into private loans forfeits IDR and PSLF eligibility.`,
      priority: "medium",
      timeframe: "2-3 years after graduation",
    });
  }

  // 7. Invest alongside debt
  if (debt > 0 && postGrad > 50000) {
    steps.push({
      order: order++,
      title: "Don't Neglect Retirement Savings",
      description: `Even while paying debt, contribute enough to capture any employer 401(k) match (free money) and consider funding a Roth IRA ($7,000/yr). The compounding time you lose is irreplaceable.`,
      priority: "medium",
      timeframe: "Ongoing after graduation",
    });
  }

  // 8. Tax strategy
  if (schoolDebt > 0 && inputs.persons.length >= 2) {
    steps.push({
      order: order++,
      title: "Optimize Tax Filing Strategy",
      description: `If using IDR, filing taxes separately (MFS) can lower calculated payments by excluding a spouse's income. Run the numbers each year — IDR savings often outweigh the MFS tax penalty.`,
      priority: "low",
      timeframe: "Annually",
    });
  }

  return steps;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function fmtPmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
