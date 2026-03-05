import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { normalizeLanguageCode, setStoredLanguagePreference, type AppLanguage } from '@/lib/language';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages: { name: string; val: AppLanguage }[] = [
    { name: 'English', val: 'en' },
    { name: 'Korean', val: 'ko' },
    { name: 'Traditional Chinese', val: 'zhTW' },
  ];

  const handleLanguageChange = (lng: AppLanguage) => {
    setStoredLanguagePreference(lng);
    i18n.changeLanguage(lng);
  };

  const activeLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language) || 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>{activeLanguage.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.val} onClick={() => handleLanguageChange(lang.val)}>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
