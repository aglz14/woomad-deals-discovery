
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../i18n/config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { MapView } from "@/components/MapView";

const Index = () => {
  const { t } = useTranslation();

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // We'll implement search functionality in the next iteration
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Discover Amazing Places
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Find and explore unique locations around you with our interactive map experience.
              </p>
            </div>
            
            <div className="relative z-10 animate-fade-up delay-150">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20 animate-fade-up delay-300">
            <div className="h-[60vh] md:h-[70vh] lg:h-[75vh]">
              <MapView />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-up delay-400">
              <div className="text-purple-600 text-2xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
              <p className="text-gray-600">
                Explore locations with our intuitive interactive map interface.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-up delay-500">
              <div className="text-purple-600 text-2xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find exactly what you're looking for with our powerful search features.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-up delay-600">
              <div className="text-purple-600 text-2xl mb-4">📍</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Location</h3>
              <p className="text-gray-600">
                Get instant updates and discover places near your current location.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
