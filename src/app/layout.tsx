import type { Metadata } from "next";
import { Outfit, DM_Serif_Display, Satisfy } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });
const satisfy = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export const metadata: Metadata = {
  title: "Sisters & Mom Pastry Shop | Fresh Baked Goods in Mabalacat, Pampanga",
  description: "Freshly baked cookies, brownies, cakes, loaves, and more. Homemade quality pastries made with love by Sisters & Mom in Dau, Mabalacat, Pampanga. Order online!",
  keywords: ["pastry shop", "bakery", "cookies", "brownies", "cakes", "Mabalacat", "Pampanga", "Dau", "homemade pastries", "order online", "Sisters and Mom"],
  authors: [{ name: "Sisters & Mom Pastry Shop" }],
  creator: "DABCAS Digital Solutions",
  verification: {
    google: "MQ9gmajrIS9eoEX7gfFU0ffEBhlJWm3T8Fv1x3olNFg",
  },
  openGraph: {
    title: "Sisters & Mom Pastry Shop",
    description: "Freshly baked cookies, brownies, cakes, loaves, and more. Homemade quality pastries made with love in Dau, Mabalacat, Pampanga.",
    url: "https://sistersandmom.site",
    siteName: "Sisters & Mom Pastry Shop",
    images: [
      {
        url: "https://sistersandmom.site/logo.jpg",
        width: 400,
        height: 400,
        alt: "Sisters & Mom Pastry Shop Logo",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sisters & Mom Pastry Shop",
    description: "Freshly baked cookies, brownies, cakes, loaves, and more. Order online!",
    images: ["https://sistersandmom.site/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Structured data for local business (JSON-LD)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: "Sisters & Mom Pastry Shop",
  image: "https://sistersandmom.site/logo.jpg",
  "@id": "https://sistersandmom.site",
  url: "https://sistersandmom.site",
  telephone: "+63-917-815-8007",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Blk 13 Lot 14 Dahlia St. Pineda Subdivision",
    addressLocality: "Dau, Mabalacat",
    addressRegion: "Pampanga",
    postalCode: "2010",
    addressCountry: "PH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 15.0444,
    longitude: 120.5867,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "20:00",
  },
  sameAs: [
    "https://www.instagram.com/bysistersandmom/",
  ],
  priceRange: "₱₱",
  servesCuisine: "Bakery",
  hasMenu: "https://sistersandmom.site/menu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#82C3A3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="S&M Pastry" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${dmSerif.variable} ${satisfy.variable} font-sans`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
