"use client";

interface Section {
  title: string;
  content: React.ReactNode;
}

function SectionBlock({ title, content }: Section) {
  return (
    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden" id="context">
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
      {/* Header */}
      <div className="border border-neutral-200 rounded-xl bg-white p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-2">Understanding Your Decision</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          This page explains every concept used in the calculator — what each repayment strategy is,
          how financial metrics are calculated, and how to think about this decision.
          Read this before you run the numbers.
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
                body: "The default federal plan. Fixed monthly payments over 10 years. You pay the least total interest because you're paying down principal quickly. Best for borrowers whose income can comfortably cover payments from day one.",
              },
              {
                name: "Extended 25-Year Repayment",
                body: "Stretches payments over 25 years, lowering the monthly burden but dramatically increasing total interest paid. Use this only if cash flow is genuinely tight. Ideally, refinance back to a shorter term once income stabilizes.",
              },
              {
                name: "SAVE Plan (Income-Driven Repayment)",
                body: "Saving on a Valuable Education (SAVE) is the newest IDR plan. Payments are based on 10% of discretionary income (AGI minus ~225% of the federal poverty line). If your payment doesn't cover the interest accruing, the government waives the difference. After 25 years of qualifying payments, the remaining balance is forgiven. The forgiven amount is currently treated as taxable income.",
              },
              {
                name: "PSLF — Public Service Loan Forgiveness",
                body: "Work for a qualifying employer (government or 501(c)(3) nonprofit), make 120 qualifying payments (10 years) on an IDR plan, and the remaining balance is forgiven tax-free. For optometrists, qualifying employers include FQHCs, VA hospitals, Indian Health Service, state health departments, military, and some academic medical centers.",
              },
              {
                name: "Aggressive Payoff",
                body: "Paying more than the minimum each month (+$500/mo modeled) dramatically reduces total interest and time to payoff. Best strategy once you have stable income and a solid emergency fund (3-6 months of expenses).",
              },
              {
                name: "Forbearance",
                body: "A temporary pause in payments during hardship or residency. Critical warning: interest capitalizes (is added to principal) at the end. This increases long-term debt. IDR plans are almost always better than forbearance because interest doesn't capitalize on SAVE.",
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

      {/* Funding Offsets */}
      <SectionBlock
        title="Ways to Reduce the Debt Load"
        content={
          <div className="space-y-4">
            <p className="text-neutral-500">
              Every dollar that reduces initial borrowing saves significantly more in interest over time.
              Pursue these aggressively before and during school:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: "Scholarships & Grants",
                  body: "AAOPT Foundation, state optometry associations, and most OD schools offer merit/need-based scholarships. Apply every year.",
                },
                {
                  title: "Employer Tuition Assistance",
                  body: "Some practice chains (VSP, MyEyeDr, America's Best) offer $10k-$30k in tuition reimbursement or signing bonuses.",
                },
                {
                  title: "Military HPSP",
                  body: "Army, Navy, and Air Force offer full tuition + monthly stipend in exchange for active duty service after graduation.",
                },
                {
                  title: "IHS Loan Repayment",
                  body: "Up to $40k/year in tax-free loan repayment for working at an IHS facility. 2-year commitment, renewable. Pairs with PSLF.",
                },
                {
                  title: "NHSC",
                  body: "Up to $50k tax-free for 2-year commitment at an approved health shortage site. OD is an eligible discipline.",
                },
                {
                  title: "State Loan Repayment Programs",
                  body: "Many states offer loan repayment for providers in underserved areas. Check your state's health department.",
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

      {/* Key Financial Metrics */}
      <SectionBlock
        title="Key Financial Metrics"
        content={
          <div className="space-y-3">
            {[
              {
                metric: "Debt-to-Income Ratio (DTI)",
                explain: "Total debt divided by combined annual household income. Under 2x is manageable; 2-3.5x is caution; above 3.5x warrants serious reconsideration.",
                benchmark: "< 2x = good | 2-3.5x = caution | > 3.5x = high risk",
              },
              {
                metric: "Loan-to-Income Ratio",
                explain: "Total student loan debt divided by expected annual salary. Most planners recommend keeping this under 1.5x.",
                benchmark: "< 1.5x = comfortable | 1.5-2.5x = workable | > 2.5x = challenging",
              },
              {
                metric: "Payment-to-Income %",
                explain: "Loan payment as percentage of monthly gross income. Under 10-15% is ideal. Above 20-25% crowds out savings and life goals.",
                benchmark: "< 15% = comfortable | 15-25% = tight | > 25% = high pressure",
              },
              {
                metric: "Opportunity Cost",
                explain: "The value of what you give up. Delaying school 2 years means foregoing 2 years of post-grad salary — typically $240k+ in foregone income.",
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

      {/* Optometry Context */}
      <SectionBlock
        title="Optometry Career Financial Context"
        content={
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Avg Starting Salary", value: "$110K-$125K", note: "Private practice, corporate" },
                { label: "Avg Mid-Career", value: "$130K-$160K", note: "5-10 years experience" },
                { label: "Practice Owner", value: "$150K-$250K+", note: "Highly variable" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-neutral-50 border border-neutral-100 p-4 text-center">
                  <p className="text-xl font-bold text-neutral-900">{s.value}</p>
                  <p className="text-sm font-medium text-neutral-600 mt-1">{s.label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{s.note}</p>
                </div>
              ))}
            </div>
            <p className="text-neutral-500 text-sm">
              OD school takes 4 years after undergrad. Many complete a 1-year residency after graduation
              ($45-$65k salary). OD is a stable, high-demand profession with 9% projected job growth through 2032.
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs text-amber-800 font-semibold mb-1">Important</p>
              <p className="text-xs text-amber-700">
                Average OD debt at graduation is $200,000-$230,000. The profession has well-worn paths
                to managing this debt — especially PSLF, IHS, and NHSC. Plan these strategies in advance.
              </p>
            </div>
          </div>
        }
      />

      {/* Couple Finance */}
      <SectionBlock
        title="Managing This as a Couple"
        content={
          <div className="space-y-4">
            {[
              {
                tip: "File taxes strategically",
                detail: "If on IDR, filing separately (MFS) can lower calculated payments by excluding partner income. Run the numbers — IDR savings often outweigh the MFS tax penalty.",
              },
              {
                tip: "Build an emergency fund first",
                detail: "Before school starts, aim for 6 months of household expenses in a HYSA. This protects against financial shock during school and residency.",
              },
              {
                tip: "Don't over-optimize for debt",
                detail: "Keep contributing to a Roth IRA ($7k/year) even while paying loans. The compounding time you lose is irreplaceable.",
              },
              {
                tip: "Plan for the single-income years",
                detail: "While the student is in school, one income carries the household. Budget explicitly for this before it happens.",
              },
              {
                tip: "Communicate about risk tolerance",
                detail: "Debt affects people differently. Have an honest conversation about what level of monthly payment feels manageable. This tool gives numbers — the decision requires alignment on values too.",
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
          Consult a licensed financial advisor or student loan specialist before making major financial decisions.
        </p>
      </div>
    </div>
  );
}
