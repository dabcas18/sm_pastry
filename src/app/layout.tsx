import type { Metadata } from "next";
import { Inter, Satisfy } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const satisfy = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export const metadata: Metadata = {
  title: "Sisters & Mom Pastry Shop | Fresh Baked Goods in Mabalacat, Pampanga",
  description: "Freshly baked cookies, brownies, cakes, loaves, and more. Homemade quality pastries made with love by Sisters & Mom in Dau, Mabalacat, Pampanga. Order online!",
  verification: {
    google: "MQ9gmajrIS9eoEX7gfFU0ffEBhlJWm3T8Fv1x3olNFg",
  },
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
