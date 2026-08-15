import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/context/LanguageContext";

export function PreferencesToggle() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Thème clair" : "Thème sombre"}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang(lang === "fr" ? "mg" : "fr")}
        aria-label="Changer de langue"
      >
        <Languages size={16} className="mr-1" />
        {lang === "fr" ? "FR" : "MG"}
      </Button>
    </div>
  );
}
