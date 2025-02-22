
import { Info, Users, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Nosotros() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-20 mt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Transformando la experiencia de compra en centros comerciales a través de la innovación digital
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Nuestra Misión</h2>
                <p className="text-lg text-gray-600">
                  Conectar a comerciantes y consumidores a través de una plataforma
                  innovadora que simplifica la gestión de promociones y mejora la
                  experiencia de compra en centros comerciales.
                </p>
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Nuestra Visión</h2>
                <p className="text-lg text-gray-600">
                  Ser la plataforma líder en la transformación digital del comercio
                  minorista, creando experiencias de compra más inteligentes y
                  personalizadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-6">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Comunidad
                </h3>
                <p className="text-gray-600">
                  Construimos relaciones sólidas entre comerciantes y clientes,
                  fomentando una comunidad vibrante y colaborativa.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Innovación
                </h3>
                <p className="text-gray-600">
                  Buscamos constantemente nuevas formas de mejorar la experiencia
                  de compra a través de soluciones tecnológicas.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-6">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Crecimiento
                </h3>
                <p className="text-gray-600">
                  Impulsamos el crecimiento sostenible de los negocios y
                  contribuimos al desarrollo del comercio local.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
