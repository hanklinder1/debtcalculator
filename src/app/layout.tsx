import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OD School Financial Decision Tool",
  description: "A comprehensive financial analysis tool for evaluating optometry school debt and ROI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
