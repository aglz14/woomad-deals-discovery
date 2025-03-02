import { registerSW as registerVitePWA } from 'virtual:pwa-register';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    // Use a flag to prevent double registration
    if (window.__SW_REGISTERED) return;

    try {
      // Register the Vite PWA service worker
      const updateSW = registerVitePWA({
        immediate: true,
        onRegistered(r) {
          // Listen for push notifications
          if (r) {
            r.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'GEOFENCE_NOTIFICATION') {
                const { title, body } = event.data;
                if (Notification.permission === 'granted') {
                  new Notification(title, { body });
                }
              }
            });
          }
        },
        onNeedRefresh() {
          if (confirm('New content available. Reload?')) {
            console.log("Reloading page after service worker update attempt...")
            updateSW(true)
          }
        },
        onOfflineReady() {
          console.log('App ready to work offline')
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