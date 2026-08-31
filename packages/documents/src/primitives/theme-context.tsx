import { createContext, useContext, type ReactNode } from "react";
import type { PdfTheme } from "../themes/themes";

const PdfThemeContext = createContext<PdfTheme | null>(null);

export interface PdfThemeProviderProps {
  children: ReactNode;
  theme: PdfTheme;
}

export function PdfThemeProvider({ children, theme }: PdfThemeProviderProps) {
  return (
    <PdfThemeContext.Provider value={theme}>
      {children}
    </PdfThemeContext.Provider>
  );
}

export function usePdfTheme(): PdfTheme {
  const theme = useContext(PdfThemeContext);
  if (!theme) {
    throw new Error(
      "PDF primitives require PageFrame, DocumentFrame or PdfThemeProvider.",
    );
  }
  return theme;
}
