
import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AdminMallNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <Header />
      <main className="flex-grow mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-4 sm:py-6 lg:py-8">
        <Button variant="ghost" className="mb-4 sm:mb-6" asChild>
          <Link to="/promotions">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Promociones
          </Link>
        </Button>
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Centro Comercial No Encontrado</h3>
          <p className="mt-2 text-gray-500">El centro comercial que buscas no existe o ha sido eliminado</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
