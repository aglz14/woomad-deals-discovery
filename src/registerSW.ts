
// Register service worker for PWA functionality
export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

// Add the global window property for SW registration tracking
declare global {
  interface Window {
    __SW_REGISTERED: boolean;
  }
}
