"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeMenu() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="relative size-8 after:absolute after:-inset-1.5"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="m12 9 4.65-4.65" />
        <path d="m12 14.3 7.37-7.37" />
        <path d="m12 19.6 8.85-8.85" />
      </svg>
    </Button>
  );
}
