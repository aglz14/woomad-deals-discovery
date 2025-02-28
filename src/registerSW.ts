
export function registerSW() {
  if ('serviceWorker' in navigator) {
    // Use a flag to prevent double registration
    if (window.__SW_REGISTERED) return;
    
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered successfully: ', registration);
          window.__SW_REGISTERED = true;
        })
        .catch(error => {
          console.error('SW registration failed: ', error);
        });
    });
  }
}

// Add the missing type
declare global {
  interface Window {
    __SW_REGISTERED?: boolean;
  }
}
