
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useRegisterSW } from 'virtual:pwa-register/react';

// PWA installation event interface
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  // Register and set up the service worker
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service worker registered:', r);
    },
    onRegisterError(error) {
      console.error('Service worker registration error:', error);
    },
    immediate: true,
    // This parameter will help avoid unnecessary update prompts
    skipWaiting: false
  });

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Store the install prompt event for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    await installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }
    
    setInstallPrompt(null);
  };

  // Only show update prompt if there's an actual update
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  
  // Track if we've already shown this update prompt
  const [hasAttemptedUpdate, setHasAttemptedUpdate] = useState(false);

  useEffect(() => {
    // Reset the flag when needRefresh changes
    if (!needRefresh) {
      setHasAttemptedUpdate(false);
      setShowUpdatePrompt(false);
      return;
    }
    
    // Only show the prompt if we haven't attempted to update yet
    if (needRefresh && !hasAttemptedUpdate) {
      // Add a delay before showing the update prompt
      const timer = setTimeout(() => {
        setShowUpdatePrompt(true);
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timer);
    }
  }, [needRefresh, hasAttemptedUpdate]);
  
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <p className="mb-2">Nueva actualización disponible</p>
        <Button 
          onClick={() => {
            console.log("Updating service worker...");
            // First hide the prompt to avoid confusion
            setShowUpdatePrompt(false);
            // Mark that we've attempted this update
            setHasAttemptedUpdate(true);
            
            // Update the service worker
            // Since updateServiceWorker might not return a Promise in all cases
            const result = updateServiceWorker(true);
            
            // Force reload after a short delay regardless of Promise status
            setTimeout(() => {
              console.log("Reloading page after service worker update attempt...");
              window.location.reload(true); // Force reload from server
            }, 1000);
          }}
        >
          Actualizar
        </Button>
      </div>
    );
  }

  if (!installPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <p className="mb-2">Instala Woomad para acceso rápido</p>
      <Button onClick={handleInstallClick}>
        Instalar App
      </Button>
    </div>
  );
}
