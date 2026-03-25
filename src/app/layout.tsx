import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Optometry School Debt Planner",
  description: "A comprehensive financial planning tool for evaluating optometry school debt, repayment strategies, and ROI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
