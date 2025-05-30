// src/components/UI/NotificationContainer.js
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import SaleNotification from './SaleNotification';

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  // Função global para adicionar notificações
  useEffect(() => {
    window.showSaleNotification = (sale) => {
      const id = Date.now();
      const notification = { ...sale, id };
      
      setNotifications(prev => [...prev, notification]);
      
      // Auto remove após 5 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    return () => {
      delete window.showSaleNotification;
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="animate-slide-in cursor-pointer"
          onClick={() => removeNotification(notification.id)}
        >
          <SaleNotification sale={notification} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default NotificationContainer;