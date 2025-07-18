import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    dailyReadings: 'Daily Mass Readings',
    readings: 'Readings',
    saint: 'Saint',
    homily: 'Homily',
    firstReading: 'First Reading',
    psalm: 'Responsorial Psalm',
    secondReading: 'Second Reading',
    gospelAcclamation: 'Gospel Acclamation',
    gospel: 'Gospel',
    saintOfTheDay: 'Saint of the Day',
    feastDay: 'Feast Day',
    patronOf: 'Patron of',
    loading: 'Loading...',
    error: 'Error loading content',
    language: 'Language',
    copyright: 'Copyright',
    spiritualReflection: 'Spiritual Reflection',
    retry: 'Retry',
    generateNew: 'Generate New Reflection'
  },
  es: {
    dailyReadings: 'Lecturas Diarias de la Misa',
    readings: 'Lecturas',
    saint: 'Santo',
    homily: 'Homilía',
    firstReading: 'Primera Lectura',
    psalm: 'Salmo Responsorial',
    secondReading: 'Segunda Lectura',
    gospelAcclamation: 'Aclamación del Evangelio',
    gospel: 'Evangelio',
    saintOfTheDay: 'Santo del Día',
    feastDay: 'Día de la Fiesta',
    patronOf: 'Patrón de',
    loading: 'Cargando...',
    error: 'Error al cargar el contenido',
    language: 'Idioma',
    copyright: 'Derechos de autor',
    spiritualReflection: 'Reflexión Espiritual',
    retry: 'Reintentar',
    generateNew: 'Generar Nueva Reflexión'
  },
  fr: {
    dailyReadings: 'Lectures Quotidiennes de la Messe',
    readings: 'Lectures',
    saint: 'Saint',
    homily: 'Homélie',
    firstReading: 'Première Lecture',
    psalm: 'Psaume Responsorial',
    secondReading: 'Deuxième Lecture',
    gospelAcclamation: 'Acclamation de l\'Évangile',
    gospel: 'Évangile',
    saintOfTheDay: 'Saint du Jour',
    feastDay: 'Jour de Fête',
    patronOf: 'Patron de',
    loading: 'Chargement...',
    error: 'Erreur de chargement du contenu',
    language: 'Langue',
    copyright: 'Droits d\'auteur',
    spiritualReflection: 'Réflexion Spirituelle',
    retry: 'Réessayer',
    generateNew: 'Générer Nouvelle Réflexion'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};