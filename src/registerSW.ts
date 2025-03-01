
import { registerSW as registerVitePWA } from 'virtual:pwa-register';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    // Use a flag to prevent double registration
    if (window.__SW_REGISTERED) return;
    
    try {
      // Register the Vite PWA service worker
      const updateSW = registerVitePWA({
        onRegistered(registration) {
          console.log('Service worker registered successfully:', registration);
          window.__SW_REGISTERED = true;
        },
        onRegisterError(error) {
          console.error('Service worker registration failed:', error);
        }
      });
      
      return updateSW;
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  }
}

// Add the missing type
declare global {
  interface Window {
    __SW_REGISTERED?: boolean;
  }
}
