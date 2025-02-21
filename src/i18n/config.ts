
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Header
      login: "Login / Sign Up",
      logout: "Log out",
      myPromotions: "My Promotions",
      switchToSpanish: "Cambiar a Español",
      switchToEnglish: "Switch to English",

      // Search
      search: "Search",
      searchPlaceholder: "Search for shops, malls or deals...",
      
      // Categories and Sections
      categories: "Categories",
      deals: "Deals",
      promotions: "Promotions",
      sales: "Sales",
      nearMe: "Near Me",
      shoppingCenters: "Shopping Centers",
      shops: "Shops",
      managePromotions: "Manage Promotions",

      // Promotion Types
      promotion: "Promotion",
      coupon: "Coupon",
      sale: "Sale",

      // Promotion Management
      addPromotion: "Add Promotion",
      addShoppingMall: "Add Shopping Mall",
      promotionTitle: "Promotion Title",
      description: "Description",
      startDate: "Start Date",
      endDate: "End Date",
      selectMall: "Select Mall",
      selectStore: "Select Store",
      conditions: "Description & Conditions",

      // Buttons
      submit: "Submit",
      cancel: "Cancel",
      back: "Back",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      refresh: "Refresh Page",

      // Auth Forms
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      signUp: "Sign Up",
      createAccount: "Create Account",
      resetPassword: "Reset Password",

      // Footer
      quickLinks: "Quick Links",
      about: "About Us",
      contact: "Contact",
      connect: "Connect",
      rights: "All rights reserved.",

      // Error Messages
      errorTitle: "Something went wrong",
      tryRefreshing: "Please try refreshing the page",
      locationError: "Could not get your location. Showing all promotions instead.",
      noPromotions: "No active promotions found",
      checkBack: "Check back later for new deals and promotions.",
      noResults: "No matches found",
      adjustSearch: "Try adjusting your search terms to find more promotions."
    }
  },
  es: {
    translation: {
      // Header
      login: "Iniciar Sesión / Registrarse",
      logout: "Cerrar Sesión",
      myPromotions: "Mis Promociones",
      switchToSpanish: "Cambiar a Español",
      switchToEnglish: "Switch to English",

      // Search
      search: "Buscar",
      searchPlaceholder: "Busca tiendas, centros comerciales u ofertas...",

      // Categories and Sections
      categories: "Categorías",
      deals: "Ofertas",
      promotions: "Promociones",
      sales: "Rebajas",
      nearMe: "Cerca de mí",
      shoppingCenters: "Centros Comerciales",
      shops: "Tiendas",
      managePromotions: "Gestionar Promociones",

      // Promotion Types
      promotion: "Promoción",
      coupon: "Cupón",
      sale: "Rebaja",

      // Promotion Management
      addPromotion: "Agregar Promoción",
      addShoppingMall: "Agregar Centro Comercial",
      promotionTitle: "Título de la Promoción",
      description: "Descripción",
      startDate: "Fecha de Inicio",
      endDate: "Fecha de Fin",
      selectMall: "Seleccionar Centro Comercial",
      selectStore: "Seleccionar Tienda",
      conditions: "Descripción y Condiciones",

      // Buttons
      submit: "Enviar",
      cancel: "Cancelar",
      back: "Volver",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      refresh: "Actualizar Página",

      // Auth Forms
      email: "Correo Electrónico",
      password: "Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      signUp: "Registrarse",
      createAccount: "Crear Cuenta",
      resetPassword: "Restablecer Contraseña",

      // Footer
      quickLinks: "Enlaces Rápidos",
      about: "Sobre Nosotros",
      contact: "Contacto",
      connect: "Conectar",
      rights: "Todos los derechos reservados.",

      // Error Messages
      errorTitle: "Algo salió mal",
      tryRefreshing: "Por favor, intenta actualizar la página",
      locationError: "No se pudo obtener tu ubicación. Mostrando todas las promociones.",
      noPromotions: "No se encontraron promociones activas",
      checkBack: "Vuelve más tarde para ver nuevas ofertas y promociones.",
      noResults: "No se encontraron resultados",
      adjustSearch: "Intenta ajustar los términos de búsqueda para encontrar más promociones."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // default language
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
