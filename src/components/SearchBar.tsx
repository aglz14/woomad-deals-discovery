
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "./ui/input";

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors border-2 border-purple-100 focus-visible:border-purple-300 rounded-xl shadow-lg"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-sm">
        Press '/' to search
      </div>
    </div>
  );
};
