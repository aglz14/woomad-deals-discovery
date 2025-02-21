
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { Header } from "@/components/Header";
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
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="space-y-8 animate-fade-up">
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
