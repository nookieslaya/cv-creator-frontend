import { useEffect, useMemo, useState } from "react";
import type { CvTheme } from "../types/theme";

const DEFAULT_THEMES: Record<string, CvTheme> = {
  "premium-modern": {
    primaryColor: "#0f172a",
    secondaryColor: "#475569",
    accentColor: "#0f766e",
    skills: {
      layout: "list",
    },
    fontScale: {
      name: 26,
      section: 10,
      body: 12,
      meta: 10,
    },
    spacing: {
      section: 14,
      item: 10,
    },
    layout: {
      columnGap: 20,
    },
  },
  "premium-executive": {
    primaryColor: "#0f172a",
    secondaryColor: "#1e293b",
    accentColor: "#1e293b",
    skills: {
      layout: "list",
    },
    fontScale: {
      name: 22,
      section: 11,
      body: 12,
      meta: 10,
    },
    spacing: {
      section: 12,
      item: 10,
    },
    layout: {
      sidebarWidth: 220,
      columnGap: 24,
    },
  },
};

const FALLBACK_THEME = DEFAULT_THEMES["premium-modern"];

export function useCvTheme(template: string) {
  const defaults = useMemo(() => DEFAULT_THEMES[template] ?? FALLBACK_THEME, [template]);
  const [theme, setTheme] = useState<CvTheme>(defaults);

  useEffect(() => {
    setTheme(defaults);
  }, [defaults]);

  const updateTheme = (next: Partial<CvTheme>) => {
    setTheme((prev) => ({
      ...prev,
      ...next,
      skills: { ...prev.skills, ...next.skills },
      fontScale: { ...prev.fontScale, ...next.fontScale },
      spacing: { ...prev.spacing, ...next.spacing },
      layout: { ...prev.layout, ...next.layout },
    }));
  };

  const resetTheme = () => setTheme(defaults);

  const supportsLayout =
    template === "premium-modern" || template === "premium-executive";

  return {
    theme,
    defaults,
    updateTheme,
    resetTheme,
    supportsLayout,
    isTemplateSupported: Boolean(DEFAULT_THEMES[template]),
  };
}
