import type { Metadata } from "next";
import "./globals.css";
import NoiseTexture from "@/components/NoiseTexture";
import LoadingScreen from "@/components/LoadingScreen";

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
    <html lang="zh">
      <body className="font-sans antialiased">
        <LoadingScreen />
        <NoiseTexture />
        {children}
      </body>
    </html>
  );
}
