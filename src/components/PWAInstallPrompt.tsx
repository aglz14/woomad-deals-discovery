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

  // Comments for clarity
  // showUpdatePrompt and hasAttemptedUpdate are already defined above

  useEffect(() => {
    // Check if we have a stored update attempt in sessionStorage
    const hasUpdatedBefore = sessionStorage.getItem('hasAttemptedUpdate') === 'true';
    
    // If we already attempted an update in this session, keep that state
    if (hasUpdatedBefore) {
      setHasAttemptedUpdate(true);
    }
    
    // Reset the flag when needRefresh is false
    if (!needRefresh) {
      setShowUpdatePrompt(false);
      return;
    }

    // Only show the prompt if we haven't attempted to update yet
    if (needRefresh && !hasAttemptedUpdate && !hasUpdatedBefore) {
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
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
    
    // Hide our UI regardless of the outcome
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">Instalar aplicación</h3>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="-mt-1 -mr-1">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Instala Woomad para acceder más fácilmente a ofertas y promociones cerca de ti.</p>
      <div className="flex justify-end">
        <Button size="sm" onClick={handleInstallClick}>
          Instalar
        </Button>
      </div>
    </div>
  );
}
