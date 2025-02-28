import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// PWA installation event interface
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [hasAttemptedUpdate, setHasAttemptedUpdate] = useState(false);

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
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for updates
    if (needRefresh && !hasAttemptedUpdate) {
      setShowUpdatePrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [needRefresh, hasAttemptedUpdate]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await installPrompt.userChoice;
    console.log(`User ${outcome} the installation`);

    // Clear the prompt
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

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
            // Store in sessionStorage to persist across page reloads
            sessionStorage.setItem('hasAttemptedUpdate', 'true');

            // Update the service worker
            try {
              // Call updateServiceWorker without expecting a Promise return
              updateServiceWorker(true);
              console.log("Service worker update triggered");

              // Force reload after a short delay
              setTimeout(() => {
                console.log("Reloading page after service worker update attempt...");
                window.location.reload(true); // Force reload from server
              }, 1000);
            } catch (error) {
              console.error("Error updating service worker:", error);
              // Even if there's an error, reload the page to get a fresh state
              setTimeout(() => window.location.reload(true), 1000);
            }
          }}
        >
          Actualizar
        </Button>
      </div>
    );
  }

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">Instala Woomad</h3>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="-mt-1 -mr-1">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mb-2">Instala Woomad para acceso rápido</p>
      <Button onClick={handleInstallClick}>
        Instalar App
      </Button>
    </div>
  );
}