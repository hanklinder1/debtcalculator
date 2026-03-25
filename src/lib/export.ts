"use client";

import { AppInputs, fmt, totalCombinedDebt, totalPostGradIncome, totalMonthlyExpenses, blendedRate, computeRepaymentStrategies, computeVerdict, computeSuggestedPath, RepaymentResult, PathStep } from "./finance";

// ─── PDF Export ────────────────────────────────────────────────────────────

export async function exportToPDF(inputs: AppInputs) {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Plan Report", 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, y);
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Verdict
  const verdict = computeVerdict(inputs);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Assessment", 20, y);
  y += 7;
  doc.setFontSize(11);
  const verdictColor = verdict.score === "green" ? [22, 163, 74] : verdict.score === "yellow" ? [202, 138, 4] : [220, 38, 38];
  doc.setTextColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.text(verdict.headline, 20, y);
  doc.setTextColor(0, 0, 0);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(verdict.summary, pageWidth - 40);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 4 + 6;

  // Key Metrics
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Key Metrics", 20, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Metric", "Value"]],
    body: verdict.keyMetrics.map((m) => [m.label, m.value]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // Person Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Person Summary", 20, y);
  y += 4;

  const personRows = inputs.persons.map((p) => [
    p.name,
    fmt(p.currentDebt),
    fmt(p.income),
    fmt(p.monthlyExpenses),
    fmt(p.schoolCost),
    fmt(p.fundingOffset),
    fmt(p.expectedPostGradSalary),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Name", "Current Debt", "Income", "Expenses/mo", "School Cost", "Funding", "Post-Grad Salary"]],
    body: personRows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // Repayment Strategies
  const strategies = computeRepaymentStrategies(inputs);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Repayment Strategies", 20, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: 20, right: 20 },
    head: [["Strategy", "Monthly", "Total Paid", "Interest", "Years", "Forgiven"]],
    body: strategies.map((s: RepaymentResult) => [
      s.strategy,
      fmt(s.monthlyPayment),
      fmt(s.totalPaid),
      fmt(s.totalInterest),
      String(s.yearsToPayoff),
      s.forgiven && s.forgiven > 1000 ? fmt(s.forgiven) : "—",
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: { 0: { cellWidth: 50 } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // Suggested Path
  const path = computeSuggestedPath(inputs);
  if (path.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Suggested Path", 20, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: 20, right: 20 },
      head: [["Step", "Action", "Priority", "Timeframe"]],
      body: path.map((s: PathStep) => [
        String(s.order),
        `${s.title}\n${s.description}`,
        s.priority.toUpperCase(),
        s.timeframe,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [17, 17, 17], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 85 }, 2: { cellWidth: 20 } },
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Grad School Debt Planner — For educational purposes only, not financial advice.", 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 35, 285);
  }

  doc.save("financial-plan.pdf");
}

// ─── Excel Export ──────────────────────────────────────────────────────────

export async function exportToExcel(inputs: AppInputs) {
  const XLSX = await import("xlsx");

  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const debt = totalCombinedDebt(inputs);
  const postGrad = totalPostGradIncome(inputs);
  const expenses = totalMonthlyExpenses(inputs);
  const rate = blendedRate(inputs);
  const verdict = computeVerdict(inputs);

  const overviewData = [
    ["GRAD SCHOOL DEBT PLANNER — FINANCIAL REPORT"],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ["ASSESSMENT"],
    ["Status", verdict.headline],
    ["Summary", verdict.summary],
    [],
    ["KEY METRICS"],
    ...verdict.keyMetrics.map((m) => [m.label, m.value]),
    [],
    ["TOTALS"],
    ["Total Combined Debt", fmt(debt)],
    ["Total Post-Grad Income", fmt(postGrad)],
    ["Total Monthly Expenses", fmt(expenses)],
    ["Blended Interest Rate", `${rate.toFixed(2)}%`],
    ["Debt-to-Income Ratio", postGrad > 0 ? `${(debt / postGrad).toFixed(1)}x` : "N/A"],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
  ws1["!cols"] = [{ wch: 30 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Overview");

  // Sheet 2: Person Details
  const personHeaders = ["Name", "Current Debt", "Debt Rate", "Annual Income", "Monthly Expenses", "School Cost", "School Rate", "Funding Offset", "Expected Post-Grad Salary"];
  const personRows = inputs.persons.map((p) => [
    p.name,
    p.currentDebt,
    `${p.debtRate}%`,
    p.income,
    p.monthlyExpenses,
    p.schoolCost,
    `${p.schoolRate}%`,
    p.fundingOffset,
    p.expectedPostGradSalary,
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet([personHeaders, ...personRows]);
  ws2["!cols"] = personHeaders.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws2, "People");

  // Sheet 3: Repayment Strategies
  const strategies = computeRepaymentStrategies(inputs);
  const stratHeaders = ["Strategy", "Monthly Payment", "Total Paid", "Total Interest", "Years to Payoff", "Forgiven"];
  const stratRows = strategies.map((s) => [
    s.strategy,
    s.monthlyPayment,
    s.totalPaid,
    s.totalInterest,
    s.yearsToPayoff,
    s.forgiven && s.forgiven > 1000 ? s.forgiven : "—",
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet([stratHeaders, ...stratRows]);
  ws3["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Repayment Plans");

  // Sheet 4: Suggested Path
  const path = computeSuggestedPath(inputs);
  const pathHeaders = ["Step", "Action", "Description", "Priority", "Timeframe"];
  const pathRows = path.map((s) => [s.order, s.title, s.description, s.priority.toUpperCase(), s.timeframe]);

  const ws4 = XLSX.utils.aoa_to_sheet([pathHeaders, ...pathRows]);
  ws4["!cols"] = [{ wch: 6 }, { wch: 35 }, { wch: 60 }, { wch: 12 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Suggested Path");

  XLSX.writeFile(wb, "financial-plan.xlsx");
}
