import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./home.css";
import "./lesson.css";

export const metadata: Metadata = {
  title: { default: "Jav's Lab", template: "%s | Jav's Lab" },
  description: "Learn artificial intelligence, machine learning, and mathematics through interactive visual experiments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#090a0a] text-white" suppressHydrationWarning>
        <div id="top" />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
