
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
  
  useEffect(() => {
    // We can add logic here to check if the update is significant
    // For now, we'll just add a small delay to avoid showing the prompt unnecessarily
    if (needRefresh) {
      // Add a delay before showing the update prompt
      const timer = setTimeout(() => {
        setShowUpdatePrompt(true);
      }, 2000); // 2 second delay
      
      return () => clearTimeout(timer);
    } else {
      setShowUpdatePrompt(false);
    }
  }, [needRefresh]);
  
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <p className="mb-2">Nueva actualización disponible</p>
        <Button onClick={() => updateServiceWorker(true)}>
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
