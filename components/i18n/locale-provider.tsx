"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/types";

const STORAGE_KEY = "freelens.locale.v1";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Dictionary;
  /** False until the stored choice has been read, so SSR and first paint match. */
  hydrated: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Reads the visitor's preference once, in this order:
 *   1. what they chose here before
 *   2. the browser's language, if it is Dutch
 *   3. English
 *
 * Only the primary subtag is checked, so nl-NL and nl-BE both count. Anything
 * else, including a browser that lists Dutch second, gets English: guessing
 * from a secondary preference is how people end up on a page they did not ask
 * for and cannot find the switch out of.
 */
function detectLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private mode or storage disabled. Fall through to the browser language.
  }

  return resolveInitialLocale(stored, window.navigator?.language ?? "");
}

/**
 * The detection rule on its own, so it can be tested without a browser.
 *
 * Exported for `locale-provider.test.ts`; nothing else should call it.
 */
export function resolveInitialLocale(
  stored: string | null,
  browserLanguage: string
): Locale {
  if (isLocale(stored)) return stored;
  if (browserLanguage.toLowerCase().split("-")[0] === "nl") return "nl";
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render are both English, which is what the
  // prerendered HTML contains. Switching happens in the effect below, after
  // hydration, so the markup can never mismatch.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLocaleState(detectLocale());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Keep the document in step: screen readers and translation tools both read
  // `lang`, and getting it wrong makes a Dutch page sound like mangled English.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Choice still applies to this session; it just will not be remembered.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: getDictionary(locale), hydrated }),
    [locale, setLocale, hydrated]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside a LocaleProvider");
  }
  return context;
}

/** The dictionary on its own, which is what almost every component wants. */
export function useT(): Dictionary {
  return useLocale().t;
}

/**
 * Sets the document title for a route from the dictionary.
 *
 * The static `metadata` export renders the English title into the prerendered
 * HTML, which is correct for the default locale and for crawlers. This updates
 * it once the visitor's choice is known.
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const apply = () => {
      document.title = title;
      if (description) {
        document
          .querySelector('meta[name="description"]')
          ?.setAttribute("content", description);
      }
    };

    apply();

    // Next resolves the route's static `metadata` into the head after
    // hydration, which overwrites whatever the first effect pass wrote. How
    // long that takes varies with the size of the route, so a fixed delay is a
    // race. Watching the head and reapplying is deterministic: whenever
    // something replaces the title with a value we did not set, we set it back.
    const head = document.querySelector("head");
    if (!head) return;
    const observer = new MutationObserver(() => {
      if (document.title !== title) apply();
    });
    observer.observe(head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [title, description]);
}
