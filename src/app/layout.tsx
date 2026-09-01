import type { Metadata } from "next";
import { Geist, Noto_Sans_Myanmar } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const myanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "Meetta Talent OS",
  description: "A focused workspace for modern talent operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${myanmar.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
