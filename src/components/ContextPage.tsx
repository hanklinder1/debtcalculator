"use client";

interface Section {
  title: string;
  icon: string;
  content: React.ReactNode;
}

function SectionBlock({ title, icon, content }: Section) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="px-5 py-4 text-sm text-slate-600 leading-relaxed space-y-3">{content}</div>
    </div>
  );
}

export default function ContextPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <h2 className="text-lg font-semibold text-indigo-900 mb-2">Understanding Your Decision</h2>
        <p className="text-sm text-indigo-700 leading-relaxed">
          This page explains every concept used in the calculator — what each repayment strategy is,
          how financial metrics are calculated, what to look out for, and how to think about this
          decision as a couple. Read this before you run the numbers.
        </p>
      </div>

      {/* Repayment Strategies */}
      <SectionBlock
        title="Repayment Strategies Explained"
        icon="📋"
        content={
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-800 mb-1">Standard 10-Year Repayment</p>
              <p>
                The default federal plan. Fixed monthly payments over 10 years. You pay the least total
                interest of any plan because you&apos;re paying down principal quickly. Best for borrowers
                whose income can comfortably cover payments from day one.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">Extended 25-Year Repayment</p>
              <p>
                Stretches payments over 25 years, lowering the monthly burden but dramatically increasing
                total interest paid. Use this only if cash flow is genuinely tight and you need room to
                breathe. Ideally, refinance back to a shorter term once income stabilizes.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">SAVE Plan (Income-Driven Repayment)</p>
              <p>
                Saving on a Valuable Education (SAVE) is the newest IDR plan. Payments are based on
                10% of your discretionary income (AGI minus ~225% of the federal poverty line). A key
                benefit: if your payment doesn&apos;t cover the interest accruing, the government waives the
                difference — your balance doesn&apos;t grow. After 25 years of qualifying payments, the
                remaining balance is forgiven. The forgiven amount is currently treated as taxable income
                (though Congress has periodically changed this), so plan for a potential tax bill in year 25.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">PSLF — Public Service Loan Forgiveness</p>
              <p>
                One of the most powerful tools available. Work for a qualifying employer — federal, state, or
                local government, or a 501(c)(3) nonprofit — make 120 qualifying payments (10 years) on an
                IDR plan, and the remaining balance is forgiven <strong className="text-emerald-600">tax-free</strong>.
                For optometrists, qualifying employers include:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-500">
                <li>Federally Qualified Health Centers (FQHCs)</li>
                <li>VA hospitals and VA-affiliated clinics</li>
                <li>Indian Health Service (IHS)</li>
                <li>State or county health departments</li>
                <li>Military (Active Duty service)</li>
                <li>Some academic medical centers and university clinics</li>
              </ul>
              <p className="mt-2">
                PSLF historically had high denial rates due to paperwork errors — not ineligibility.
                Submit the Employment Certification Form (ECF) annually and after every job change.
                Use FedLoan (now MOHELA) as your servicer. The Biden-era improvements have significantly
                expanded access; track your count through the MOHELA portal.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">Aggressive Payoff</p>
              <p>
                Paying more than the minimum each month (the calculator models +$500/mo) dramatically
                reduces total interest and time to payoff. This is the best strategy once you have a
                stable income and a solid emergency fund (3–6 months of expenses). Even an extra $200–300/mo
                in the early years compounds meaningfully.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">Forbearance</p>
              <p>
                A temporary pause or reduction in payments, available during financial hardship or residency.
                <strong className="text-rose-600"> Critical warning:</strong> in general forbearance, interest
                continues to accrue and capitalizes (is added to your principal balance) at the end. This
                increases your long-term debt. Only use this as a last resort. IDR plans are almost always
                better than forbearance because interest doesn&apos;t capitalize on SAVE.
              </p>
            </div>
          </div>
        }
      />

      {/* Funding Offsets */}
      <SectionBlock
        title="Ways to Reduce the Debt Load"
        icon="💸"
        content={
          <div className="space-y-3">
            <p>
              Every dollar that reduces initial borrowing saves you significantly more in interest over time.
              Pursue these aggressively before and during school:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: "Scholarships & Grants",
                  body: "AAOPT Foundation, state optometry associations, and most OD schools offer merit/need-based scholarships. Apply every year — many students don't reapply after year 1.",
                },
                {
                  title: "Employer Tuition Assistance",
                  body: "Some private practice chains (VSP, MyEyeDr, America's Best) offer tuition reimbursement or signing bonuses. Typically $10k–$30k in exchange for a post-graduation employment commitment.",
                },
                {
                  title: "Military Health Professions Scholarship (HPSP)",
                  body: "Army, Navy, and Air Force offer full tuition + monthly stipend in exchange for active duty service after graduation. Excellent option if military service is appealing.",
                },
                {
                  title: "Indian Health Service (IHS) Loan Repayment",
                  body: "Up to $40k/year in tax-free loan repayment for working at an IHS facility or tribal health program. 2-year initial commitment, renewable. Pairs perfectly with PSLF.",
                },
                {
                  title: "National Health Service Corps (NHSC)",
                  body: "Similar to IHS — up to $50k tax-free for 2-year commitment at an approved health shortage site. OD is an eligible discipline.",
                },
                {
                  title: "State Loan Repayment Programs (SLRP)",
                  body: "Many states offer their own loan repayment for providers who practice in underserved areas. Awards vary widely — check your state's health department.",
                },
                {
                  title: "Part-Time Work / Optician Role",
                  body: "Many OD students work as opticians or ophthalmic techs during school, earning $20–$30/hr to offset living expenses and reduce borrowing.",
                },
                {
                  title: "Savings & Contributions",
                  body: "Your own savings + your partner's income contributions can meaningfully reduce how much you borrow. Even $20k–$40k pre-saved creates a real dent.",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <p className="font-medium text-slate-800 text-xs mb-1">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        }
      />

      {/* Key Financial Metrics */}
      <SectionBlock
        title="Key Financial Metrics Explained"
        icon="📊"
        content={
          <div className="space-y-3">
            {[
              {
                metric: "Debt-to-Income Ratio (DTI)",
                explain:
                  "Total debt divided by combined annual household income. Under 2x is manageable; 2–3.5x is a yellow flag; above 3.5x warrants serious reconsideration or aggressive mitigation (scholarships, PSLF planning).",
                benchmark: "< 2x = good, 2–3.5x = caution, > 3.5x = high risk",
              },
              {
                metric: "Loan-to-Income Ratio",
                explain:
                  "Total student loan debt divided by expected annual salary. Most financial planners recommend keeping this under 1.5x. For ODs earning $130–150k carrying $200k, that&apos;s a 1.3–1.5x ratio — manageable. $250k in debt on $120k is 2.1x — more difficult.",
                benchmark: "< 1.5x = comfortable, 1.5–2.5x = workable, > 2.5x = challenging",
              },
              {
                metric: "Payment-to-Income %",
                explain:
                  "Your loan payment as a percentage of monthly gross income. Under 10–15% is ideal. Above 20–25% will crowd out savings, emergencies, and life goals.",
                benchmark: "< 15% = comfortable, 15–25% = tight, > 25% = high pressure",
              },
              {
                metric: "Opportunity Cost",
                explain:
                  "The value of what you give up. If she delays school 2 years to save, she foregoes 2 years of OD salary. This is typically $240k+ in foregone income — usually far more than the interest savings from borrowing less.",
                benchmark: "Usually argues AGAINST long delays",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                <p className="font-semibold text-slate-800 text-sm">{item.metric}</p>
                <p className="text-xs text-slate-500">{item.explain}</p>
                <p className="text-xs text-indigo-600 font-medium">{item.benchmark}</p>
              </div>
            ))}
          </div>
        }
      />

      {/* Optometry-Specific Context */}
      <SectionBlock
        title="Optometry Career Financial Context"
        icon="👁"
        content={
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Avg OD Starting Salary", value: "$110,000–$125,000", note: "Private practice, corporate" },
                { label: "Avg OD Mid-Career", value: "$130,000–$160,000", note: "5–10 years experience" },
                { label: "OD Practice Owner", value: "$150,000–$250,000+", note: "Highly variable" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                  <p className="text-lg font-bold text-indigo-600">{s.value}</p>
                  <p className="text-sm font-medium text-slate-700">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.note}</p>
                </div>
              ))}
            </div>
            <p>
              OD school typically takes 4 years after undergrad. Many students complete a 1-year residency
              after graduation (some specialties require it), during which salary is $45–$65k. Factor this
              income into your early-career repayment planning — IDR plans are particularly helpful here.
            </p>
            <p>
              OD is a <strong className="text-slate-800">stable, high-demand profession</strong>. The Bureau
              of Labor Statistics projects 9% job growth through 2032 (faster than average). Geographic
              flexibility is high — ODs are needed in rural and suburban markets, and corporate optometry
              provides immediate high-income employment without the capital risk of practice ownership.
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-700 font-semibold mb-1">⚠ Important Consideration</p>
              <p className="text-xs text-amber-600">
                Average OD debt at graduation is $200,000–$230,000. You are not alone in this situation.
                The profession has well-worn paths to managing this debt — especially PSLF, IHS, and NHSC.
                Plan these strategies in advance and they can dramatically change the financial outcome.
              </p>
            </div>
          </div>
        }
      />

      {/* Couple Finance Tips */}
      <SectionBlock
        title="Managing This as a Couple"
        icon="👫"
        content={
          <div className="space-y-3">
            {[
              {
                tip: "File taxes strategically",
                detail:
                  "If on an IDR plan, filing taxes separately (MFS) can lower her calculated payment by excluding your income. Run the numbers — the IDR savings often outweigh the MFS tax penalty, especially if your income is high.",
              },
              {
                tip: "Build an emergency fund first",
                detail:
                  "Before she starts school, aim to have 6 months of household expenses in a HYSA. This protects you from financial shock during school and residency.",
              },
              {
                tip: "Don't over-optimize for debt",
                detail:
                  "Many couples become so laser-focused on debt that they delay everything else. Keep contributing to a Roth IRA ($7k/year) even while paying loans — the compounding time you lose is irreplaceable.",
              },
              {
                tip: "Plan for the \"two bodies, one income\" years",
                detail:
                  "While she's in school, your income carries the household. Budget explicitly for this. Know the number before it happens.",
              },
              {
                tip: "Communicate about risk tolerance",
                detail:
                  "Debt affects people differently. Have an honest conversation about what level of monthly payment feels stressful vs. manageable. This tool gives you numbers — the decision requires alignment on values and risk comfort too.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-indigo-500 flex-shrink-0 mt-0.5">→</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.tip}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Example */}
      <SectionBlock
        title="Example Scenario — How to Use This Tool"
        icon="📖"
        content={
          <div className="space-y-3">
            <p className="text-slate-700 font-medium">
              Here&apos;s a realistic example you can enter into the calculator to see how the numbers work:
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2 font-mono text-xs">
              <p className="text-slate-700 font-sans font-semibold mb-2">Inputs:</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-slate-500">
                <span>Your income (debt-free):</span> <span className="text-indigo-600 font-semibold">$65,000/yr</span>
                <span>Her current debt:</span> <span className="text-indigo-600 font-semibold">$30,000</span>
                <span>Her current debt rate:</span> <span className="text-indigo-600 font-semibold">5.5%</span>
                <span>OD school cost (4 years):</span> <span className="text-indigo-600 font-semibold">$200,000</span>
                <span>School loan rate (Grad PLUS):</span> <span className="text-indigo-600 font-semibold">8.05%</span>
                <span>Funding offset (scholarship):</span> <span className="text-indigo-600 font-semibold">$20,000</span>
                <span>Expected OD salary:</span> <span className="text-indigo-600 font-semibold">$130,000/yr</span>
                <span>Monthly household expenses:</span> <span className="text-indigo-600 font-semibold">$4,500/mo</span>
              </div>
              <p className="text-slate-700 font-sans font-semibold mt-3 mb-2">What you&apos;d see:</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-slate-500">
                <span>Total debt:</span> <span className="text-amber-600 font-semibold">$210,000</span>
                <span>Combined income:</span> <span className="text-emerald-600 font-semibold">$195,000/yr</span>
                <span>Debt-to-income ratio:</span> <span className="text-amber-600 font-semibold">1.1x ✓ Good</span>
                <span>Standard 10yr payment:</span> <span className="text-indigo-600 font-semibold">~$2,350/mo</span>
                <span>PSLF monthly payment:</span> <span className="text-emerald-600 font-semibold">~$810/mo</span>
                <span>PSLF forgiven (10yr):</span> <span className="text-emerald-600 font-semibold">~$140,000+</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              With a funding offset of $20k (scholarship), the PSLF path looks extremely compelling —
              10 years of lower payments and a large tax-free forgiveness. But it requires her to work
              at a qualifying nonprofit or government employer for those 10 years.
            </p>
          </div>
        }
      />

      {/* Disclaimer */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-500">Disclaimer:</strong> This tool provides general financial
          education and estimates only. It does not constitute professional financial, tax, or legal advice.
          Calculations use simplified models — actual loan terms, tax treatment, and forgiveness eligibility
          depend on specific circumstances. Consult a licensed financial advisor or student loan specialist
          (NSLDS, MOHELA, or a fee-only CFP with student loan expertise) before making major financial decisions.
        </p>
      </div>
    </div>
  );
}
