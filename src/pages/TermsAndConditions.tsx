import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-20 mt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Información sobre el uso de nuestros servicios
            </p>
          </div>
        </div>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg text-left">
              <h2 className="text-2xl font-semibold mb-4 text-left">
                Términos y Condiciones
              </h2>
              <p className="mb-6 text-left">
                Fecha de última actualización: 8 de marzo de 2025
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                1. ACEPTACIÓN DE LOS TÉRMINOS
              </h3>
              <p className="mb-6 text-left">
                Al acceder, utilizar o descargar la aplicación móvil Woomad (en
                adelante "la Aplicación"), el usuario (en adelante "el Usuario")
                acepta cumplir con estos Términos y Condiciones de Uso (en
                adelante "los Términos"). Si el Usuario no está de acuerdo con
                estos Términos, deberá abstenerse de utilizar la Aplicación.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                2. DESCRIPCIÓN DE LA APLICACIÓN
              </h3>
              <p className="mb-6 text-left">
                La Aplicación es una plataforma digital que permite al Usuario
                acceder a promociones y descuentos de negocios ubicados en
                centros comerciales cercanos a su ubicación. La Aplicación
                ofrece un servicio de localización y notificaciones en tiempo
                real sobre ofertas disponibles, permitiendo que el Usuario se
                beneficie de las promociones de manera sencilla.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                3. USO DE LA APLICACIÓN
              </h3>
              <p className="mb-6 text-left">
                El Usuario se compromete a usar la Aplicación únicamente para
                fines legales y conforme a estos Términos. El Usuario no podrá:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-3 text-left">
                  Utilizar la Aplicación de manera que interfiera con su
                  correcto funcionamiento.
                </li>
                <li className="mb-3 text-left">
                  Modificar, adaptar o hackear la Aplicación.
                </li>
                <li className="mb-3 text-left">
                  Violar derechos de propiedad intelectual o los derechos de
                  privacidad de otros usuarios.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                4. REGISTRO Y CUENTA DE USUARIO
              </h3>
              <p className="mb-6 text-left">
                Para acceder a ciertos servicios de la Aplicación, el Usuario
                deberá registrarse proporcionando información personal verídica
                y actualizada. El Usuario es responsable de mantener la
                confidencialidad de su cuenta y contraseña.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                5. PROMOCIONES Y DESCUENTOS
              </h3>
              <p className="mb-6 text-left">
                La Aplicación ofrece promociones y descuentos proporcionados por
                los comercios asociados. Estas ofertas están sujetas a cambios
                sin previo aviso y dependen de la disponibilidad de los
                comercios participantes. La Aplicación no es responsable de la
                validez o cumplimiento de las promociones ofrecidas por los
                comercios.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                6. PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
              </h3>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
