import { Button } from "@/components/ui/button";
import { translations, Language } from "@/lib/translations";

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  const languages: Language[] = ['en', 'es', 'de'];
  
  return (
    <div className="flex gap-2 bg-card p-2 rounded-lg shadow-card border border-border">
      {languages.map((lang) => (
        <Button
          key={lang}
          variant={currentLanguage === lang ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange(lang)}
          className="flex items-center gap-2 text-base"
        >
          <span className="text-xl">{translations[lang].flag}</span>
        </Button>
      ))}
    </div>
  );
};
