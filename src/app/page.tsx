import Image from "next/image";
import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="min-h-screen relative flex items-center overflow-hidden">
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 lg:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">OD</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">DEBT PLANNER</span>
          </div>
          <a
            href="#calculator"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Start Planning
          </a>
        </nav>

        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-24 pb-16">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-8 font-medium">
              Optometry School Financial Planner
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.08]">
              Plan Your
              <br />
              Future. Own
              <br />
              Your Debt.
            </h1>
            <p className="mt-8 text-lg text-neutral-400 leading-relaxed max-w-md">
              Debt is scary. Making the wrong call is scarier.
              <span className="text-neutral-600 font-medium"> Let&apos;s figure it out together.</span>
            </p>
            <div className="mt-10 flex items-center gap-6">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-6 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Start Planning
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#context"
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
              >
                How it works
              </a>
            </div>

            {/* Quick stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
              {[
                { label: "Avg OD Salary", value: "$130K+" },
                { label: "Avg Grad Debt", value: "$215K" },
                { label: "Repayment Plans", value: "6" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
                  <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] w-full max-w-lg ml-auto rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src="/hero.jpg"
                alt="Couple planning finances together"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating card */}
            <div className="absolute -left-8 bottom-16 bg-white border border-neutral-200 rounded-xl p-5 shadow-lg max-w-[240px]">
              <p className="text-xs text-neutral-400 uppercase tracking-wide font-medium mb-2">Key Insight</p>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Every <span className="font-semibold text-neutral-900">$10K</span> in scholarships saves you{" "}
                <span className="font-semibold text-neutral-900">$15K+</span> over a 10-year loan.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-300">
          <span className="text-xs tracking-wide">Scroll</span>
          <div className="w-px h-8 bg-neutral-200" />
        </div>
      </section>

      {/* ── Calculator ─────────────────────────────────────────── */}
      <div id="calculator">
        <Calculator />
      </div>
    </>
  );
}
