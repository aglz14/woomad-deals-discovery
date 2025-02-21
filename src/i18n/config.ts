
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      search: "Search",
      searchPlaceholder: "Search for shops, malls or deals...",
      categories: "Categories",
      deals: "Deals",
      promotions: "Promotions",
      sales: "Sales",
      nearMe: "Near Me",
      shoppingCenters: "Shopping Centers",
      shops: "Shops",
      address: "Address",
      switchToSpanish: "Cambiar a Español",
      switchToEnglish: "Switch to English",
    },
  },
  es: {
    translation: {
      search: "Buscar",
      searchPlaceholder: "Busca tiendas, centros comerciales u ofertas...",
      categories: "Categorías",
      deals: "Ofertas",
      promotions: "Promociones",
      sales: "Rebajas",
      nearMe: "Cerca de mí",
      shoppingCenters: "Centros Comerciales",
      shops: "Tiendas",
      address: "Dirección",
      switchToSpanish: "Cambiar a Español",
      switchToEnglish: "Switch to English",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
