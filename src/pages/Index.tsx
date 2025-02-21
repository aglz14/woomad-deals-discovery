
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchBar } from "@/components/SearchBar";
import { MapView } from "@/components/MapView";

const Index = () => {
  const { t } = useTranslation();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // We'll implement search functionality in the next iteration
  };

  return (
    <div className="min-h-screen bg-woomad-50">
      <LanguageSwitcher />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-up">
          <h1 className="text-4xl font-bold text-center text-woomad-900">
            Woomad
          </h1>
          
          <div className="relative z-10">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="h-[70vh] rounded-lg overflow-hidden shadow-xl">
            <MapView />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
