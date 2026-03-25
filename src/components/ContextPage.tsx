"use client";

interface Section {
  title: string;
  content: React.ReactNode;
}

function SectionBlock({ title, content }: Section) {
  return (
    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
      </div>
      <div className="px-6 py-5 text-sm text-neutral-600 leading-relaxed space-y-3">{content}</div>
    </div>
  );
}

export default function ContextPage() {
  return (
    <div className="space-y-6">
      <div className="border border-neutral-200 rounded-xl bg-white p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Understanding Your Decision</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          This page explains every concept used in the calculator — repayment strategies,
          financial metrics, common ways to reduce debt, and how to think about this decision.
        </p>
      </div>

      {/* Repayment Strategies */}
      <SectionBlock
        title="Repayment Strategies Explained"
        content={
          <div className="space-y-5">
            {[
              {
                name: "Standard 10-Year Repayment",
                body: "The default federal plan. Fixed monthly payments over 10 years. You pay the least total interest because principal is paid down quickly. Best when income comfortably covers payments from the start.",
              },
              {
                name: "Extended 25-Year Repayment",
                body: "Stretches payments over 25 years, lowering the monthly burden but dramatically increasing total interest. Use only if cash flow is genuinely tight, and refinance to a shorter term once income stabilizes.",
              },
              {
                name: "Income-Driven Repayment (IDR)",
                body: "Payments are based on 10% of your discretionary income (AGI minus ~225% of the federal poverty line). If your payment doesn't cover interest, the government may cover the difference. After 20-25 years of qualifying payments, the remaining balance is forgiven (may be taxable).",
              },
              {
                name: "Public Service Loan Forgiveness (PSLF)",
                body: "Work for a qualifying employer (government or 501(c)(3) nonprofit) for 10 years, make 120 qualifying payments on an IDR plan, and the remaining balance is forgiven tax-free. One of the most powerful tools for large balances.",
              },
              {
                name: "Aggressive Payoff",
                body: "Pay more than the minimum each month. Even an extra $200-500/mo dramatically reduces total interest and payoff time. Best once you have stable income and a 3-6 month emergency fund.",
              },
              {
                name: "Debt Avalanche",
                body: "Pay minimums on all debts, then throw all extra money at the highest interest rate first. Mathematically optimal for minimizing total interest. Requires discipline since you may not see quick wins early.",
              },
              {
                name: "Debt Snowball",
                body: "Pay minimums on all debts, then attack the smallest balance first for psychological wins. Costs slightly more in interest than the avalanche method, but the motivation from quick payoffs keeps many people on track.",
              },
              {
                name: "Refinancing",
                body: "Once you have stable income and good credit, refinancing to a lower rate can save thousands. Important: refinancing federal loans into private loans forfeits IDR and PSLF eligibility. Only refinance if you won't need those programs.",
              },
              {
                name: "Forbearance / Deferment",
                body: "A temporary pause on payments during hardship. During forbearance, interest accrues and capitalizes (is added to your principal), growing your debt. IDR plans are almost always better than forbearance. Use only as a last resort.",
              },
            ].map((item) => (
              <div key={item.name}>
                <p className="font-semibold text-neutral-900 text-sm mb-1">{item.name}</p>
                <p className="text-neutral-500 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Funding Sources */}
      <SectionBlock
        title="Common Ways to Reduce Your Debt Load"
        content={
          <div className="space-y-4">
            <p className="text-neutral-500">
              Every dollar that reduces initial borrowing saves significantly more in interest over time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: "Institutional Scholarships & Grants",
                  body: "Most graduate schools offer merit and need-based scholarships. Apply every year — many students don't reapply after year 1.",
                },
                {
                  title: "Employer Tuition Assistance",
                  body: "Many employers offer $5k-$30k in tuition reimbursement or signing bonuses, sometimes in exchange for a post-graduation employment commitment.",
                },
                {
                  title: "Graduate Assistantships",
                  body: "Teaching or research assistantships often include tuition waivers plus a stipend. Competitive but highly valuable.",
                },
                {
                  title: "Military Education Benefits",
                  body: "GI Bill, HPSP, and other military programs can cover full tuition plus provide a monthly stipend in exchange for service.",
                },
                {
                  title: "Federal Service Programs (NHSC, IHS)",
                  body: "National Health Service Corps and Indian Health Service offer up to $50k in tax-free loan repayment for working in underserved areas.",
                },
                {
                  title: "State Grant & Loan Repayment Programs",
                  body: "Many states offer grants or loan repayment for professionals who serve in high-need areas. Check your state's programs.",
                },
                {
                  title: "Part-Time Work During School",
                  body: "Working 10-20 hours/week in a related field can offset living expenses and reduce how much you borrow.",
                },
                {
                  title: "Personal Savings & Family Contributions",
                  body: "Even $20k-$40k pre-saved creates a meaningful dent. Every dollar saved is a dollar you don't pay 7-8% interest on for 10 years.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg bg-neutral-50 border border-neutral-100 p-4">
                  <p className="font-medium text-neutral-900 text-xs mb-1">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Key Metrics */}
      <SectionBlock
        title="Key Financial Metrics"
        content={
          <div className="space-y-3">
            {[
              {
                metric: "Debt-to-Income Ratio (DTI)",
                explain: "Total debt divided by combined annual income. The most important single number for assessing debt manageability.",
                benchmark: "< 2x = good | 2-3.5x = caution | > 3.5x = high risk",
              },
              {
                metric: "Payment-to-Income %",
                explain: "Loan payment as a percentage of monthly gross income. Tells you how much of your paycheck goes to debt.",
                benchmark: "< 15% = comfortable | 15-25% = tight | > 25% = high pressure",
              },
              {
                metric: "Interest Rate Impact",
                explain: "A $200,000 loan at 7% vs 5% costs roughly $35,000 more in interest over 10 years. Rate differences compound dramatically over time.",
                benchmark: "Refinancing from 8% to 5% can save $40k+",
              },
              {
                metric: "Opportunity Cost",
                explain: "The value of what you give up. Delaying school means foregoing years of post-grad salary. This is typically far more than the interest savings from borrowing less.",
                benchmark: "Usually argues AGAINST long delays",
              },
            ].map((item) => (
              <div key={item.metric} className="rounded-lg bg-neutral-50 border border-neutral-100 p-4 space-y-1">
                <p className="font-semibold text-neutral-900 text-sm">{item.metric}</p>
                <p className="text-xs text-neutral-500">{item.explain}</p>
                <p className="text-xs text-neutral-900 font-medium">{item.benchmark}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Tips */}
      <SectionBlock
        title="Smart Moves for Managing School Debt"
        content={
          <div className="space-y-4">
            {[
              {
                tip: "Build an emergency fund before school",
                detail: "Aim for 3-6 months of household expenses in a high-yield savings account. This prevents you from borrowing more when unexpected costs hit.",
              },
              {
                tip: "Borrow only what you need",
                detail: "Just because you're approved for $60k/year doesn't mean you should take it all. Every dollar you don't borrow saves $1.50+ in total repayment.",
              },
              {
                tip: "File taxes strategically",
                detail: "If married and on IDR, filing separately can lower payments by excluding a spouse's income. Run the numbers — the IDR savings often outweigh the tax penalty.",
              },
              {
                tip: "Don't neglect retirement savings",
                detail: "Even while paying debt, contribute enough to capture employer 401(k) matches (free money) and consider funding a Roth IRA. Compounding time lost is irreplaceable.",
              },
              {
                tip: "Communicate about money",
                detail: "If you're doing this with a partner, align on risk tolerance and budget expectations. This tool gives you numbers — the decision requires alignment on values too.",
              },
              {
                tip: "Revisit your plan annually",
                detail: "Income changes, interest rates change, life changes. Recalculate every year and adjust your strategy. What's optimal at graduation may not be optimal 3 years later.",
              },
            ].map((item) => (
              <div key={item.tip} className="flex gap-3">
                <div className="w-1 bg-neutral-200 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.tip}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Disclaimer */}
      <div className="border border-neutral-200 rounded-xl bg-neutral-50 p-5">
        <p className="text-xs text-neutral-400 leading-relaxed">
          <strong className="text-neutral-500">Disclaimer:</strong> This tool provides general financial
          education and estimates only. It does not constitute professional financial, tax, or legal advice.
          Consult a licensed financial advisor before making major financial decisions.
        </p>
      </div>
    </div>
  );
}
