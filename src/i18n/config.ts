
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "deals": "Find the best deals near you",
      "nearMe": "Deals Near Me",
      "searchPlaceholder": "Search for stores, malls, and deals",
      "address": "Address",
      "storeName": "Store Name",
      "description": "Description",
      "addShoppingMall": "Add Shopping Mall",
      "cancel": "Cancel",
      "selectMall": "Select Shopping Mall",
      "allMalls": "All Shopping Malls",
    }
  },
  es: {
    translation: {
      "deals": "Encuentra las mejores ofertas cerca de ti",
      "nearMe": "Ofertas Cerca de Mí",
      "searchPlaceholder": "Busca tiendas, centros comerciales y ofertas",
      "address": "Dirección",
      "storeName": "Nombre de la Tienda",
      "description": "Descripción",
      "addShoppingMall": "Agregar Centro Comercial",
      "cancel": "Cancelar",
      "selectMall": "Seleccionar Centro Comercial",
      "allMalls": "Todos los Centros Comerciales",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
