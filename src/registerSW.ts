
import { registerSW as registerVitePWA } from 'virtual:pwa-register';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      // Register the Vite PWA service worker
      const updateSW = registerVitePWA({
        onRegistered(registration) {
          console.log('Service worker registered successfully:', registration);
        },
        onRegisterError(error) {
          console.error('Service worker registration failed:', error);
        }
      });
      
      console.log('PWA registration initialized');
      return updateSW;
    } catch (error) {
      console.error('Error registering service worker:', error);
      
      // Fallback to manual registration if the Vite PWA registration fails
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Fallback SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('Fallback SW registration failed: ', registrationError);
          });
      });
    }
  }
}
