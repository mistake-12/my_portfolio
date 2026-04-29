import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Syne } from "next/font/google";
import "./globals.css";
import NoiseTexture from "@/components/NoiseTexture";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JONY MA. — Creative Designer",
  description:
    "Portfolio of Jony Ma, a creative designer specializing in industrial design, software design, interaction design, and visual design.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>J</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className={`${spaceGrotesk.variable} ${spaceMono.variable} ${syne.variable}`}>
      <body className="font-sans antialiased">
        <NoiseTexture />
        {children}
      </body>
    </html>
  );
}
