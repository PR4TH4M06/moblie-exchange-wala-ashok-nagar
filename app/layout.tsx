import type { Metadata, Viewport } from "next";
import "./globals.css";
import { shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: `${shop.name} (${shop.area}) - Buy ● Sell ● Exchange`,
  description: `${shop.name} (${shop.hindiName}), ${shop.area}, Nashik — Buy ● Sell ● Exchange, Unused Demo Upto 50% Discount, Sell Your Old Phone & Get Instant Cash, 6 Months Brand Warranty.`,
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${shop.name} (${shop.area}) - Buy ● Sell ● Exchange`,
    description: `Unused Demo Upto 50% Discount · Sell Your Old Phone & Get Instant Cash · 6 Months Brand Warranty · ${shop.area}, Nashik`,
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#18181b",
};

const isProd = process.env.NODE_ENV === "production";

const cspContent = isProd
  ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src https://maps.google.com https://www.google.com; connect-src 'self' https:; media-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
  : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https:; frame-src https://maps.google.com https://www.google.com;";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Permissions-Policy"
          content="accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()"
        />
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
