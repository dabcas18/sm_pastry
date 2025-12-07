import type { Metadata } from "next";
import { Inter, Satisfy } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const satisfy = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export const metadata: Metadata = {
  title: "Sisters' Mom Pastry",
  description: "Order Management System for Sisters' Mom Pastry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${satisfy.variable}`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
