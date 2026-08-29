import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/features/theme/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "docn-ui — PDF templates, in your codebase",
  description:
    "A source-owned PDF template toolkit in development. Follow the public implementation plan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
