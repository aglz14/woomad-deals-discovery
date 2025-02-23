
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AdminMallLoadingState() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-4 sm:py-6 lg:py-8">
        <Button variant="ghost" className="mb-4 sm:mb-6" disabled>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a Promociones
        </Button>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
