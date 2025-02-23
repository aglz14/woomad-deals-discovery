
import { Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Contacto() {
  return <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-20 mt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros
            </p>
          </div>
        </div>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
                  Información de Contacto
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-left">Email</p>
                      <a href="mailto:contacto@woomad.com" className="text-gray-600 hover:text-purple-600 transition-colors">
                        contacto@woomad.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-left">Teléfono</p>
                      <a href="tel:+34900000000" className="text-gray-600 hover:text-purple-600 transition-colors">811 485 7684</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-left">Dirección</p>
                      <p className="text-gray-600 text-left">
                        Monterrey, Nuevo León
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Image */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1483058712412-4245e9b90334" 
                  alt="Contact us" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
}
