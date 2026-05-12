import React, { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'info' | 'premium' | 'success';
}

export function NotificationOverlay() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Listener per eventi Twitch PubSub (Mockato per ora)
    const handleGlobalEvent = (event: any) => {
      const newNotif: Notification = {
        id: Math.random().toString(36),
        title: event.title || 'Evento Canale',
        message: event.message || '',
        icon: event.icon || '📢',
        type: event.isPremium ? 'premium' : 'info',
      };
      
      setNotifications(prev => [...prev, newNotif]);

      // Rimuovi dopo 5 secondi
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
    };

    // Esponiamo una funzione globale per il test in console
    (window as any).sendTestNotification = (title: string, message: string, isPremium = false) => {
      handleGlobalEvent({ title, message, isPremium, icon: isPremium ? '💎' : '📢' });
    };

    // Twitch PubSub real integration would go here:
    // if (window.Twitch?.ext) {
    //   window.Twitch.ext.listen('broadcast', (target, contentType, message) => {
    //      const data = JSON.parse(message);
    //      handleGlobalEvent(data);
    //   });
    // }

    return () => {
      delete (window as any).sendTestNotification;
    };
  }, []);

  return (
    <div className="notification-overlay">
      {notifications.map((n) => (
        <div key={n.id} className={`toast ${n.type}`}>
          <div className="toast-icon">{n.icon}</div>
          <div className="toast-content">
            <div className="toast-title">{n.title}</div>
            <div className="toast-message">{n.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
