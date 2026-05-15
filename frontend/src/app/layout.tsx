import type { Metadata, Viewport } from "next";
import "@/src/styles/globals.css";
import { Providers } from "@/src/components/layouts/Providers";

export const metadata: Metadata = {
  title: { default: "MedLink", template: "%s | MedLink" },
  description: "Your health, connected. AI-powered healthcare platform.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MedLink" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a84ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
