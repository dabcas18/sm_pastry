import type { Metadata } from "next";
import { Outfit, DM_Serif_Display, Satisfy } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });
const satisfy = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-script" });

export const metadata: Metadata = {
  title: "Sisters & Mom Pastry Shop | Best Cookies, Brownies & Cakes in Mabalacat, Pampanga",
  description: "Order fresh homemade cookies, brownies, cakes, and pastries online! Sisters & Mom Pastry Shop delivers quality baked goods in Dau, Mabalacat, Angeles City & Pampanga. Best pastry shop near me!",
  keywords: [
    "pastry shop Mabalacat", "bakery Pampanga", "cookies Dau", "brownies Angeles City",
    "cakes Mabalacat", "online pastry shop", "order cakes online Pampanga",
    "homemade cookies", "best brownies Pampanga", "pastry delivery Mabalacat",
    "Sisters and Mom", "bakery near me", "pastry shop near me",
    "custom cakes Pampanga", "birthday cakes Mabalacat", "desserts Angeles City"
  ],
  authors: [{ name: "Sisters & Mom Pastry Shop" }],
  creator: "DABCAS Digital Solutions",
  verification: {
    google: "MQ9gmajrIS9eoEX7gfFU0ffEBhlJWm3T8Fv1x3olNFg",
  },
  alternates: {
    canonical: "https://sistersandmom.site",
  },
  openGraph: {
    title: "Sisters & Mom Pastry Shop | Fresh Baked Goods in Pampanga",
    description: "Order fresh homemade cookies, brownies, cakes & pastries online! Best pastry shop in Mabalacat, Angeles City & Pampanga.",
    url: "https://sistersandmom.site",
    siteName: "Sisters & Mom Pastry Shop",
    images: [
      {
        url: "https://sistersandmom.site/logo.jpg",
        width: 400,
        height: 400,
        alt: "Sisters & Mom Pastry Shop - Best Bakery in Mabalacat Pampanga",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sisters & Mom Pastry Shop | Best Pastries in Pampanga",
    description: "Fresh homemade cookies, brownies, cakes & more. Order online for pickup in Mabalacat!",
    images: ["https://sistersandmom.site/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Organization schema for Google logo
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sisters & Mom Pastry Shop",
  url: "https://sistersandmom.site",
  logo: {
    "@type": "ImageObject",
    url: "https://sistersandmom.site/logo.jpg",
    width: 400,
    height: 400,
  },
  image: "https://sistersandmom.site/logo.jpg",
  sameAs: [
    "https://www.instagram.com/bysistersandmom/",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+63-917-815-8007",
    contactType: "customer service",
    areaServed: "PH",
    availableLanguage: ["English", "Filipino"],
  },
};

// Local Business schema for local SEO
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  "@id": "https://sistersandmom.site/#bakery",
  name: "Sisters & Mom Pastry Shop",
  image: [
    "https://sistersandmom.site/logo.jpg",
    "https://sistersandmom.site/menu.png",
  ],
  url: "https://sistersandmom.site",
  telephone: "+63-917-815-8007",
  email: "orders@sistersandmom.site",
  description: "Freshly baked cookies, brownies, cakes, loaves, and more. Homemade quality pastries made with love in Dau, Mabalacat, Pampanga. Order online for pickup!",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Blk 13 Lot 14 Dahlia St. Pineda Subdivision",
    addressLocality: "Mabalacat",
    addressRegion: "Pampanga",
    postalCode: "2010",
    addressCountry: "PH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 15.0444,
    longitude: 120.5867,
  },
  areaServed: [
    { "@type": "City", name: "Mabalacat" },
    { "@type": "City", name: "Angeles City" },
    { "@type": "City", name: "San Fernando" },
    { "@type": "State", name: "Pampanga" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/bysistersandmom/",
  ],
  priceRange: "₱100-₱500",
  servesCuisine: ["Pastries", "Baked Goods", "Cookies", "Cakes", "Brownies"],
  hasMenu: "https://sistersandmom.site/menu",
  acceptsReservations: false,
  paymentAccepted: ["Cash", "GCash", "Maya"],
  currenciesAccepted: "PHP",
};

// WebSite schema for sitelinks search
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sisters & Mom Pastry Shop",
  url: "https://sistersandmom.site",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://sistersandmom.site/menu?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${outfit.variable} ${dmSerif.variable} ${satisfy.variable} font-sans`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
