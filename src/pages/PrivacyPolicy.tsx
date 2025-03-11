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
            <div className="prose prose-lg mx-auto">
              <h2>Introducción</h2>
              <p>
                En Woomad, respetamos tu privacidad y nos comprometemos a
                proteger tus datos personales. Esta política de privacidad te
                informará sobre cómo cuidamos tus datos personales cuando
                visitas nuestro sitio web y te informará sobre tus derechos de
                privacidad y cómo la ley te protege.
              </p>

              <h2>Datos que recopilamos</h2>
              <p>
                Podemos recopilar, usar, almacenar y transferir diferentes tipos
                de datos personales sobre ti, que hemos agrupado de la siguiente
                manera:
              </p>
              <ul>
                <li>
                  Datos de identidad: nombre, apellido, nombre de usuario o
                  identificador similar
                </li>
                <li>
                  Datos de contacto: dirección de correo electrónico y números
                  de teléfono
                </li>
                <li>
                  Datos técnicos: dirección IP, datos de inicio de sesión, tipo
                  y versión del navegador
                </li>
                <li>
                  Datos de uso: información sobre cómo utilizas nuestro sitio
                  web y servicios
                </li>
              </ul>

              <h2>Cómo utilizamos tus datos</h2>
              <p>
                Utilizamos tus datos personales solo cuando la ley nos lo
                permite. Más comúnmente, utilizaremos tus datos personales en
                las siguientes circunstancias:
              </p>
              <ul>
                <li>Para registrarte como nuevo usuario</li>
                <li>Para procesar y entregar tus solicitudes</li>
                <li>Para gestionar nuestra relación contigo</li>
                <li>
                  Para mejorar nuestro sitio web, productos/servicios y
                  marketing
                </li>
              </ul>

              <h2>Seguridad de datos</h2>
              <p>
                Hemos implementado medidas de seguridad apropiadas para evitar
                que tus datos personales se pierdan, se usen o se acceda a ellos
                de manera no autorizada, se modifiquen o se divulguen.
              </p>

              <h2>Tus derechos legales</h2>
              <p>
                Bajo ciertas circunstancias, tienes derechos bajo las leyes de
                protección de datos en relación con tus datos personales,
                incluyendo el derecho a:
              </p>
              <ul>
                <li>Solicitar acceso a tus datos personales</li>
                <li>Solicitar la corrección de tus datos personales</li>
                <li>Solicitar la eliminación de tus datos personales</li>
                <li>Oponerte al procesamiento de tus datos personales</li>
                <li>
                  Solicitar la restricción del procesamiento de tus datos
                  personales
                </li>
                <li>Solicitar la transferencia de tus datos personales</li>
                <li>Retirar el consentimiento</li>
              </ul>

              <h2>Cambios a esta política de privacidad</h2>
              <p>
                Podemos actualizar nuestra política de privacidad de vez en
                cuando. Te notificaremos cualquier cambio publicando la nueva
                política de privacidad en esta página.
              </p>

              <h2>Contacto</h2>
              <p>
                Si tienes alguna pregunta sobre esta política de privacidad o
                nuestras prácticas de privacidad, contáctanos a través de
                nuestro formulario de contacto o envíanos un correo electrónico.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
