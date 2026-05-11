import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    'nav.home': 'Accueil',
    'nav.jobs': "Offres d'emploi",
    'nav.contests': 'Concours',
    'nav.events': 'Événements',
    'nav.study': 'Espace Étudiant',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Mon profil',
    'nav.admin': 'Admin',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.language': 'Langue',
  },
  en: {
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.contests': 'Contests',
    'nav.events': 'Events',
    'nav.study': 'Student Space',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'My Profile',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Sign up',
    'nav.language': 'Language',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return saved === 'en' ? 'en' : 'fr';
  });

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage: (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
      },
      t: (key: string) => translations[language][key] ?? key,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

