
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "es" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      className="fixed top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 z-50"
    >
      {t(i18n.language === "en" ? "switchToSpanish" : "switchToEnglish")}
    </Button>
  );
};
