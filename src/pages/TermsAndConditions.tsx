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
            <div className="prose prose-lg mx-auto">
              <h2>Aceptación de los términos</h2>
              <p>
                Al acceder y utilizar los servicios de Woomad, aceptas estar
                legalmente obligado por estos Términos y Condiciones. Si no
                estás de acuerdo con alguno de estos términos, no debes utilizar
                nuestros servicios.
              </p>

              <h2>Cambios en los términos</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en
                cualquier momento. Te notificaremos sobre cualquier cambio
                publicando los nuevos términos en esta página. Los cambios
                entrarán en vigor inmediatamente después de su publicación.
              </p>

              <h2>Uso de nuestros servicios</h2>
              <p>
                Nuestros servicios están destinados a ser utilizados tal como se
                ofrecen. No debes utilizar nuestros servicios:
              </p>
              <ul>
                <li>
                  De manera ilegal o de forma que infrinja cualquier ley o
                  regulación local, nacional o internacional
                </li>
                <li>
                  Para enviar, recibir, cargar, descargar o utilizar cualquier
                  material que no cumpla con nuestros estándares de contenido
                </li>
                <li>
                  Para transmitir o facilitar el envío de cualquier material
                  publicitario o promocional no solicitado
                </li>
                <li>
                  Para causar molestias, inconvenientes o ansiedad innecesaria
                </li>
              </ul>

              <h2>Cuentas de usuario</h2>
              <p>
                Cuando creas una cuenta con nosotros, debes proporcionar
                información precisa, completa y actualizada en todo momento.
                Eres responsable de mantener la confidencialidad de tu cuenta y
                contraseña, y de restringir el acceso a tu computadora y/o
                dispositivo móvil.
              </p>

              <h2>Propiedad intelectual</h2>
              <p>
                El contenido de nuestro sitio web y servicios, incluyendo pero
                no limitado a textos, gráficos, logotipos, iconos, imágenes,
                clips de audio, descargas digitales y compilaciones de datos, es
                propiedad de Woomad o de sus proveedores de contenido y está
                protegido por las leyes de propiedad intelectual.
              </p>

              <h2>Limitación de responsabilidad</h2>
              <p>
                En ningún caso Woomad, sus directores, empleados, socios,
                agentes, proveedores o afiliados serán responsables por
                cualquier daño indirecto, incidental, especial, consecuente o
                punitivo, incluyendo sin limitación, pérdida de beneficios,
                datos, uso, buena voluntad u otras pérdidas intangibles,
                resultantes de:
              </p>
              <ul>
                <li>Tu uso o incapacidad para usar nuestros servicios</li>
                <li>
                  Cualquier acceso no autorizado o uso de nuestros servidores
                  seguros y/o toda la información personal almacenada en ellos
                </li>
                <li>
                  Cualquier interrupción o cese de la transmisión hacia o desde
                  nuestros servicios
                </li>
                <li>
                  Cualquier error, virus, troyano o similar que pueda ser
                  transmitido a través de nuestros servicios
                </li>
              </ul>

              <h2>Ley aplicable</h2>
              <p>
                Estos términos se regirán e interpretarán de acuerdo con las
                leyes del país donde Woomad tiene su sede principal, sin tener
                en cuenta sus disposiciones sobre conflictos de leyes.
              </p>

              <h2>Contacto</h2>
              <p>
                Si tienes alguna pregunta sobre estos Términos y Condiciones,
                contáctanos a través de nuestro formulario de contacto o
                envíanos un correo electrónico.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
