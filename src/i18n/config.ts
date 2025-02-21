
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
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
      "managePromotions": "Gestionar Promociones",
      "addPromotion": "Agregar Promoción",
      "errorTitle": "Ha ocurrido un error",
      "mallDeletedSuccess": "Centro comercial eliminado con éxito",
      "errorDeletingMall": "Error al eliminar el centro comercial",
      "deleteMallTitle": "Eliminar Centro Comercial",
      "deleteMallDescription": "¿Estás seguro que deseas eliminar este centro comercial? Esta acción no se puede deshacer.",
      "delete": "Eliminar",
      "quickLinks": "Enlaces Rápidos",
      "about": "Acerca de",
      "contact": "Contacto",
      "connect": "Conectar",
      "rights": "Todos los derechos reservados",
      "addStore": "Agregar Tienda",
      "newStore": "Nueva Tienda",
      "storeCategory": "Categoría",
      "storeDescription": "Descripción de la Tienda",
      "storeFloor": "Piso",
      "storeLocation": "Ubicación en el Centro Comercial",
      "storeContact": "Teléfono de Contacto",
      "promotion": "Promoción",
      "coupon": "Cupón",
      "sale": "Oferta",
      "selectType": "Seleccionar Tipo",
      "startDate": "Fecha de Inicio",
      "endDate": "Fecha de Fin",
      "selectStore": "Seleccionar Tienda",
      "backToHome": "Volver al Inicio",
      "editMall": "Editar Centro Comercial",
      "mallName": "Nombre del Centro Comercial",
      "latitude": "Latitud",
      "longitude": "Longitud",
      "update": "Actualizar",
      "mallUpdatedSuccess": "Centro comercial actualizado con éxito",
      "searchMalls": "Buscar centros comerciales"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Set Spanish as default
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
