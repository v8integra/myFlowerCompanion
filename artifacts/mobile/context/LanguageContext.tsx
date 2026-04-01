import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LangCode, t as translate, TRANSLATIONS } from "@/translations";

const STORAGE_KEY = "@myflowercompanion_lang";
const DEFAULT_LANG: LangCode = "en";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: async () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && stored in TRANSLATIONS) {
        setLangState(stored as LangCode);
      }
    });
  }, []);

  const setLang = useCallback(async (code: LangCode) => {
    setLangState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
