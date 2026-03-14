import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedStore - Medical E-Commerce",
  description: "Premium medical e-commerce solution",
};

import { Providers } from "@/components/providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${manrope.variable} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
