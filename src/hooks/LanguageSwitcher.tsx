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

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const languages: {
    name: string
    val: string
  }[] = [
      { name: "English", val: "en" },
      { name: "Korean", val: "ko" }
    ]
  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return (
    <DropdownMenu >
      <DropdownMenuTrigger asChild >
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>{i18n.language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.name}
            onClick={() => handleLanguageChange(lang.val)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default LanguageSwitcher;