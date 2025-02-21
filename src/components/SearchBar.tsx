
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "./ui/input";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-woomad-500" />
      </div>
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="pl-10 pr-4 h-12 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};
