
import { Building2, Info, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AboutPage = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Acerca de Woomad
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubre una nueva forma de explorar y conectar con comercios locales. 
          Woomad te acerca a las mejores ofertas y promociones de tu ciudad.
        </p>
      </section>

      {/* Mission and Values */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-4">
                  <Info className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nuestra Misión</h3>
                <p className="text-gray-600">
                  Conectar a compradores con los mejores comercios locales, 
                  facilitando el descubrimiento de ofertas únicas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Comunidad</h3>
                <p className="text-gray-600">
                  Construimos puentes entre comerciantes y consumidores, 
                  creando una comunidad vibrante y activa.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-4">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovación</h3>
                <p className="text-gray-600">
                  Utilizamos tecnología de punta para mejorar la experiencia 
                  de compra y venta en tu ciudad.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Nuestro Equipo</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-600 mb-8">
            Somos un equipo apasionado por crear conexiones significativas 
            entre comercios y consumidores. Nuestra experiencia en tecnología 
            y comercio local nos permite ofrecer la mejor plataforma para 
            descubrir ofertas y promociones.
          </p>
        </div>
      </section>
    </div>
  );
};
