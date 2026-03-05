import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom';
import i18n from './lib/i18n';
import api from './services/fetch';
import { getStoredLanguagePreference, normalizeLanguageCode, resolveLanguageFromCountryCode } from './lib/language';

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Router>
        <App />
      </Router>
    </StrictMode>,
  );
};

const applyGeoBasedLanguage = async () => {
  if (typeof window === 'undefined') return;
  if (getStoredLanguagePreference()) return;

  try {
    const response = await api.get<{ countryCode?: string | null }>('utility/client-country');
    const countryLanguage = resolveLanguageFromCountryCode(response?.data?.countryCode);
    if (!countryLanguage) return;

    const currentLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
    if (currentLanguage !== countryLanguage) {
      await i18n.changeLanguage(countryLanguage);
    }
  } catch {
    // Silent fallback to existing language resolution.
  }
};

renderApp();
void applyGeoBasedLanguage();
