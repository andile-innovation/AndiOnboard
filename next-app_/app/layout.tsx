import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AndiOnboard - Career Intelligence",
  description: "Your intelligent gateway to mastering your career progression.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="andionboard">
      {/* CRITICAL FIX: Forced the arbitrary background utility color directly 
        onto the body element to lock down the system canvas layer globally.
      */}
      <body className={`${inter.className} min-h-screen w-full bg-[#6141a2]`}>
        {children}
      </body>
    </html>
  );
}