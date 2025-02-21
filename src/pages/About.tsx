
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>
      
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Acerca de</h1>
        <p className="text-gray-600 text-lg">
          Bienvenido a nuestra plataforma de gestión de centros comerciales y promociones.
        </p>
      </div>
    </div>
  );
}
