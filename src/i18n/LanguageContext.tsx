import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INDIAN_LANGUAGES,
  IndianLanguageMeta,
  TranslationBundle,
  getTranslations,
  getLanguageMeta,
} from './indianLanguages.ts';

interface LanguageContextValue {
  lang: string;
  meta: IndianLanguageMeta;
  t: TranslationBundle;
  languages: IndianLanguageMeta[];
  setLang: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  meta: INDIAN_LANGUAGES[0],
  t: getTranslations('en'),
  languages: INDIAN_LANGUAGES,
  setLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('buy4achange_lang');
      if (saved && INDIAN_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const meta = getLanguageMeta(lang);
  const t = getTranslations(lang);

  useEffect(() => {
    try {
      localStorage.setItem('buy4achange_lang', lang);
    } catch {}
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
  }, [lang, meta.rtl]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        meta,
        t,
        languages: INDIAN_LANGUAGES,
        setLang: setLangState,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
