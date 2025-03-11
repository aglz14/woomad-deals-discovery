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
              <p className="mb-6 text-left">
                El tratamiento de los datos personales del Usuario se realiza
                conforme a nuestra Política de Privacidad, que está disponible
                en la Aplicación. El Usuario autoriza el uso de sus datos
                personales para las finalidades descritas en dicha política,
                incluyendo la localización para personalizar las promociones
                ofrecidas.
              </p>

              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                7. GEOLOCALIZACIÓN Y NOTIFICACIONES
              </h3>
              <p className="mb-6 text-left">
                La Aplicación utiliza servicios de geolocalización para
                identificar la ubicación del Usuario y ofrecer promociones
                cercanas. El Usuario podrá desactivar esta función en cualquier
                momento desde los ajustes de su dispositivo móvil.
              </p>
              <p className="mb-6 text-left">
                La Aplicación también enviará notificaciones push sobre nuevas
                promociones, descuentos y ofertas. El Usuario podrá gestionar
                las notificaciones desde los ajustes de su dispositivo.{" "}
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                8. DERECHOS DE PROPIEDAD
              </h3>
              <p className="mb-6 text-left">
                La Aplicación, su diseño, contenido, logotipos, marcas
                comerciales y demás elementos relacionados son propiedad
                exclusiva de Woomad o de sus licenciatarios. El Usuario no podrá
                reproducir, distribuir ni utilizar estos elementos sin el
                permiso expreso y por escrito de los titulares de los derechos
                correspondientes.
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                9. LIMITACIÓN DE RESPONSABILIDAD
              </h3>
              <p className="mb-6 text-left">
                La Aplicación no garantiza la disponibilidad continua o la
                exactitud de las promociones. El Usuario reconoce y acepta que
                las promociones y descuentos dependen de los comercios
                participantes y que estos pueden cambiar o cancelarse sin previo
                aviso.
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                10. TERMINACIÓN DE LA CUENTA
              </h3>
              <p className="mb-6 text-left">
                El Usuario puede desactivar su cuenta en cualquier momento desde
                la Aplicación. Woomad se reserva el derecho de suspender o
                cancelar la cuenta de un Usuario si se detecta el incumplimiento
                de estos Términos.
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                11. MODIFICACIONES A LOS TÉRMINOS
              </h3>
              <p className="mb-6 text-left">
                Woomad se reserva el derecho de modificar estos Términos en
                cualquier momento. Cualquier modificación será publicada en la
                Aplicación y entrará en vigor inmediatamente después de su
                publicación. El uso continuado de la Aplicación después de los
                cambios implica la aceptación de los nuevos Términos.
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                12. LEY APLICABLE Y JURISDICCIÓN
              </h3>
              <p className="mb-6 text-left">
                Estos Términos se regirán e interpretarán de acuerdo con las
                leyes de los Estados Unidos Mexicanos. En caso de cualquier
                controversia, las partes se someten a la jurisdicción de los
                tribunales competentes de Monterrey, México.
              </p>
              <h3 className="text-xl font-semibold mt-8 mb-4 text-left">
                13. CONTACTO
              </h3>
              <p className="mb-6 text-left">
                Si el Usuario tiene alguna pregunta o comentario sobre estos
                Términos, puede ponerse en contacto con nosotros a través de la
                siguiente dirección de correo electrónico: info@woomad.com
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
