import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasDismissed = localStorage.getItem('installPromptDismissed');

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      if (!hasDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsVisible(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-slide-up flex justify-center md:bottom-4 md:right-4 md:left-auto md:max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-5 w-full flex items-center gap-4 border border-gray-100">
        <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
          <Download size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">Install App</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            Get the Attendance App on your home screen for faster access.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="btn-primary py-2 px-4 text-sm whitespace-nowrap"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 flex justify-center items-center"
            aria-label="Dismiss"
          >
            <span className="text-xs font-medium mr-1">Maybe Later</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
