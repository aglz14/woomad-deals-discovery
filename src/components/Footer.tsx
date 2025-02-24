
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
export const Footer = () => {
  const {
    t
  } = useTranslation();
  const year = new Date().getFullYear();
  return <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Woomad</h3>
            <p className="text-gray-600">Making Retail Great Again!</p>
          </div>
          
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/nosotros" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('connect')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/woomad/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            © {year} Woomad. {t('rights')}
          </p>
        </div>
      </div>
    </footer>;
};
