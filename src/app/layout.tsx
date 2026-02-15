import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jose Alejandro Aldama Ramos| AI Engineer",
  description:
    "Personal portfolio of Jose Alejandro Aldama Ramos — AI Engineer specializing in GenAI, Cloud Architecture, and Full-Stack Development.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "Deep Learning",
    "LangChain",
    "Next.js",
    "Portfolio",
    "Jose Alejandro Aldama Ramos",
  ],
  authors: [{ name: "Jose Alejandro Aldama Ramos" }],
  openGraph: {
    title: "Jose Alejandro Aldama Ramos | AI Engineer",
    description:
      "AI Engineer specializing in GenAI, Cloud Architecture, and Full-Stack Development.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jose Alejandro Aldama Ramos | AI Engineer",
    description:
      "AI Engineer specializing in GenAI, Cloud Architecture, and Full-Stack Development.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
