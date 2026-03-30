import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import zh from "./zh.json";
import en from "./en.json";

export type Lang = "zh" | "en";

type Dict = Record<string, unknown>;

const DICTS: Record<Lang, Dict> = {
  zh: zh as unknown as Dict,
  en: en as unknown as Dict,
};

const STORAGE_KEY = "i18n.lang";

function normalizeLang(input: string | null | undefined): Lang | null {
  if (!input) return null;
  const s = String(input).trim().toLowerCase().replace("_", "-");
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("en")) return "en";
  return null;
}

function detectBrowserLang(): Lang | null {
  if (typeof navigator === "undefined") return null;

  const langs: string[] = [];
  if (Array.isArray(navigator.languages)) langs.push(...navigator.languages);
  if (navigator.language) langs.push(navigator.language);

  for (const l of langs) {
    const n = normalizeLang(l);
    if (n) return n;
  }
  return null;
}

function getInitialLang(): Lang {
  // Priority:
  // 1) user preference (localStorage)
  // 2) browser language
  // 3) zh
  // 4) en (only as translation fallback, not initial)
  if (typeof window === "undefined") return "zh";

  const stored = normalizeLang(window.localStorage.getItem(STORAGE_KEY));
  if (stored) return stored;

  const detected = detectBrowserLang();
  if (detected) return detected;

  return "zh";
}

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;

  const parts = path.split(".");
  let cur: unknown = obj;

  for (const p of parts) {
    if (
      cur &&
      typeof cur === "object" &&
      p in (cur as Record<string, unknown>)
    ) {
      cur = (cur as Record<string, unknown>)[p];
      continue;
    }
    return undefined;
  }

  return cur;
}

function getString(dict: Dict, key: string): string | undefined {
  const v = getByPath(dict, key);
  return typeof v === "string" ? v : undefined;
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? m : String(v);
  });
}

export type TFunction = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

export type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: TFunction;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, _setLang] = useState<Lang>(() => getInitialLang());

  const setLang = useCallback((next: Lang) => {
    _setLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    _setLang((prev) => (prev === "zh" ? "en" : "zh"));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage failures (private mode, disabled storage, etc.)
    }

    // Keep <html lang="..."> in sync for accessibility and heuristics.
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t: TFunction = useCallback(
    (key, vars) => {
      // Fallback chain: current -> zh -> en -> key
      const primary = getString(DICTS[lang], key);
      const fallbackZh = getString(DICTS.zh, key);
      const fallbackEn = getString(DICTS.en, key);
      const raw = primary ?? fallbackZh ?? fallbackEn ?? key;
      return interpolate(raw, vars);
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
    }),
    [lang, setLang, toggleLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}
