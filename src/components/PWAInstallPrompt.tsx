'use client';

import { useEffect, useState } from 'react';
import { Download, Bell, X, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Register service worker
    registerServiceWorker();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install banner after a delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    // Check notification permission
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);

      // Show notification banner if not granted and not dismissed
      const notifDismissed = localStorage.getItem('pwa-notif-dismissed');
      if (Notification.permission === 'default' && !notifDismissed) {
        setTimeout(() => setShowNotificationBanner(true), 5000);
      }

      // Check if already subscribed
      checkSubscription();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async function checkSubscription() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  }

  async function handleEnableNotifications() {
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        await subscribeToPush();
        setShowNotificationBanner(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push messaging is not supported');
      alert('Push notifications are not supported in this browser');
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key not found');
      alert('Push notification configuration error');
      return;
    }

    try {
      console.log('Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed, updating server...');
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: existingSubscription.toJSON(),
            userAgent: navigator.userAgent
          })
        });
        setIsSubscribed(true);
        return;
      }

      console.log('Subscribing to push with VAPID key...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Subscription successful:', subscription);

      // Save subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      setIsSubscribed(true);
      console.log('Push subscription saved successfully');
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      alert(`Failed to enable notifications: ${error.message || 'Unknown error'}`);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function dismissInstall() {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  }

  function dismissNotification() {
    setShowNotificationBanner(false);
    localStorage.setItem('pwa-notif-dismissed', 'true');
  }

  // Don't render anything if both banners are hidden
  if (!showInstallBanner && !showNotificationBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 space-y-2 md:left-auto md:right-4 md:w-80">
      {/* Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-brand-green" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">Install App</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Install S&M Pastry for quick access and offline support
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-3 py-1.5 bg-brand-green text-white text-xs font-medium rounded-lg hover:bg-brand-green-dark transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={dismissInstall}
                  className="px-3 py-1.5 text-gray-500 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button onClick={dismissInstall} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {showNotificationBanner && notificationStatus === 'default' && !isSubscribed && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">Enable Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Get notified when new orders are placed
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleEnableNotifications}
                  className="flex-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Enable
                </button>
                <button
                  onClick={dismissNotification}
                  className="px-3 py-1.5 text-gray-500 text-xs font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button onClick={dismissNotification} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success indicator when subscribed */}
      {isSubscribed && notificationStatus === 'granted' && showNotificationBanner && (
        <div className="bg-green-50 rounded-xl shadow-lg border border-green-100 p-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-sm">Notifications Enabled</h3>
              <p className="text-xs text-green-600">You'll be notified of new orders</p>
            </div>
            <button onClick={dismissNotification} className="text-green-400 hover:text-green-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
