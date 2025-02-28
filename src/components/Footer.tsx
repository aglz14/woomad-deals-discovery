
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <Link 
                to="/" 
                className="inline-block transform hover:scale-105 transition-transform duration-200"
              >
                <img 
                  src="/lovable-uploads/c852587b-0ed0-4fee-9630-1f53f53a9ea3.png" 
                  alt="Woomad Commerce" 
                  className="h-10"
                />
              </Link>
              <p className="text-gray-600 text-sm mt-2 text-center">
                Making Retail Great Again!
              </p>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/nosotros" 
                  className="text-gray-600 hover:text-purple-600 transition-colors inline-block transform hover:-translate-y-0.5 transition-transform duration-200"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="text-gray-600 hover:text-purple-600 transition-colors inline-block transform hover:-translate-y-0.5 transition-transform duration-200"
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Social Links Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('connect')}
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://www.instagram.com/woomad.commerce/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-purple-600 transition-colors inline-flex items-center gap-2 group"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/company/woomad/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-purple-600 transition-colors inline-flex items-center gap-2 group"
                >
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {year} Woomad. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
