import { Geist } from "next/font/google";

import type { Metadata, Viewport } from "next";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.locale}
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
