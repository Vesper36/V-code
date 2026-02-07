import { create } from 'zustand';
import { translations, Language } from './translations';
import { useStore } from '@/lib/store/useStore';
import { useEffect } from 'react';

interface I18nState {
  t: typeof translations['en'];
}

// Hook to get the current translation object
export const useTranslation = () => {
  const language = useStore((state) => state.settings.language);
  // Default to 'zh' if language is undefined (migration safety)
  const currentLang = language || 'zh';
  return translations[currentLang];
};
