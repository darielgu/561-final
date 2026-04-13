import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

function patchBrokenServerLocalStorage() {
  if (typeof window !== "undefined") return;

  try {
    const ls = (globalThis as { localStorage?: unknown }).localStorage as
      | {
          getItem?: (key: string) => string | null;
          setItem?: (key: string, value: string) => void;
          removeItem?: (key: string) => void;
          clear?: () => void;
        }
      | undefined;

    if (!ls || typeof ls.getItem === "function") return;

    const noop = () => {};
    const getNull = () => null;
    ls.getItem = getNull;
    ls.setItem = noop;
    ls.removeItem = noop;
    ls.clear = noop;
  } catch {
    // Ignore invalid runtime localStorage implementations.
  }
}

patchBrokenServerLocalStorage();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI vs Human Detector Demo",
  description: "Brutalist one-page demo for text origin prediction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
