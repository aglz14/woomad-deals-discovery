import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-20 mt-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Política de Privacidad
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Información sobre cómo protegemos y utilizamos tus datos
            </p>
          </div>
        </div>

        {/* Content Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg text-left">
              <h2 className="text-2xl font-semibold mb-4 text-left">
                Aviso de Privacidad
              </h2>
              <p className="mb-6 text-left">
                Fecha de última actualización: 8 de marzo de 2025
              </p>

              <p className="mb-6 text-left">
                En Woomad (en adelante "la Aplicación"), respetamos tu
                privacidad y estamos comprometidos a proteger tus datos
                personales y a mantener con nosotros. El presente Aviso de
                Privacidad tiene como objetivo informarte sobre cómo
                recolectamos, usamos, almacenamos y protegemos tu información
                personal, así como los derechos que tienes sobre tus datos.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                1. Información que recabamos
              </h3>
              <p className="mb-4 text-left">
                La Aplicación recaba la siguiente información personal:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-3 text-left">
                  <span className="font-medium">
                    Datos proporcionados por el usuario:
                  </span>{" "}
                  Cuando te registras en la Aplicación o haces uso de ciertas
                  funcionalidades, podemos solicitarte que nos proporciones
                  información personal como tu nombre, correo electrónico, y
                  contraseña.
                </li>
                <li className="mb-3 text-left">
                  <span className="font-medium">Datos de ubicación:</span> Con
                  el fin de mostrarte promociones cercanas a tu ubicación,
                  recolectamos tu ubicación geográfica de manera anónima. La
                  información de ubicación solo se utilizará para ofrecerte un
                  mejor servicio.
                </li>
                <li className="mb-3 text-left">
                  <span className="font-medium">
                    Datos de uso de la aplicación:
                  </span>{" "}
                  Recolectamos información relacionada con tu uso de la
                  Aplicación, tales como las promociones que visualizas o las
                  interacciones que realizas dentro de la plataforma.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                2. Información que recolectamos se utiliza para los siguientes
                fines:
              </h3>
              <ul className="list-disc pl-6 mb-6">
                <li className="mb-3 text-left">
                  Proporcionar y mejorar la experiencia de la Aplicación,
                  incluyendo la personalización de las promociones basadas en tu
                  ubicación.
                </li>
                <li className="mb-3 text-left">
                  Enviar notificaciones relacionadas con las promociones y
                  actualizaciones de la Aplicación.
                </li>
                <li className="mb-3 text-left">
                  Analizar el uso de la Aplicación con fines estadísticos para
                  mejorar su funcionamiento.
                </li>
                <li className="mb-3 text-left">
                  Cumplir con las obligaciones legales y fiscales relacionadas
                  con el uso de la Aplicación.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                3. Servicios de terceros
              </h3>
              <p className="mb-6 text-left">
                La Aplicación utiliza servicios de terceros para almacenar y
                gestionar los datos, específicamente Supabase, que es un
                servicio que nos ayuda a gestionar la base de datos y la
                autenticación de usuarios. Estos proveedores de servicios están
                sujetos a sus propias políticas de privacidad, y solo accederán
                a los datos de los usuarios según sea necesario para brindar los
                servicios. No compartimos tus datos con terceros para fines de
                marketing sin tu consentimiento.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                4. Conservación de datos
              </h3>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
