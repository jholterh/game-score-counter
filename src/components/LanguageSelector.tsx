import { Button } from "@/components/ui/button";
import { translations, Language } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const languages: Language[] = ['en', 'es', 'de'];

  const getLanguageName = (lang: Language) => {
    const names = {
      en: 'English',
      es: 'Español',
      de: 'Deutsch',
    };
    return names[lang];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <span className="text-lg">{translations[currentLanguage].flag}</span>
          <span className="hidden sm:inline">{getLanguageName(currentLanguage)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg">{translations[lang].flag}</span>
            <span>{getLanguageName(lang)}</span>
            {currentLanguage === lang && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
