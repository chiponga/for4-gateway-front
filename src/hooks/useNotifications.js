// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { Criptografar, Descriptografar } from '../utils/crypto';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket, connected } = useSocket();

  // ================================================================
  // FETCH NOTIFICATIONS
  // ================================================================

  const fetchNotifications = useCallback((limit = 20, unreadOnly = false) => {
    if (!socket || !connected) return;

    setLoading(true);

        const token = localStorage.getItem('token');

        const payload = Criptografar(JSON.stringify({
            limit: limit,
            unread_only: unreadOnly,
            token: token
        }));
        socket.emit('GetNotifications', payload);

    const handleResponse = (data) => {
      try {
        const response = JSON.parse(Descriptografar(data));
        if (response.success) {
          setNotifications(response.data.notifications);
          setUnreadCount(response.data.unread_count);
        } else {
          toast.error(response.message);
        }
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
        toast.error('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };

    socket.once('GetNotificationsResponse', handleResponse);

    // Timeout
    const timeout = setTimeout(() => {
      socket.off('GetNotificationsResponse', handleResponse);
      setLoading(false);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      socket.off('GetNotificationsResponse', handleResponse);
    };
  }, [socket, connected]);

  // ================================================================
  // MARK AS READ
  // ================================================================

  const markAsRead = useCallback((notificationId) => {
    if (!socket || !connected) return Promise.reject('Not connected');

    return new Promise((resolve, reject) => {

        const token = localStorage.getItem('token')

      const payload = { 
        notification_id: notificationId,
        token: token 
      };
      socket.emit('MarkNotificationRead', Criptografar(JSON.stringify(payload)));

      const handleResponse = (data) => {
        try {
          const response = JSON.parse(Descriptografar(data));
          if (response.success) {
            // Atualizar estado local
            setNotifications(prev => 
              prev.map(notif => 
                notif.id === notificationId 
                  ? { ...notif, read: true, read_at: new Date().toISOString() }
                  : notif
              )
            );
            
            // Decrementar contador
            setUnreadCount(prev => Math.max(0, prev - 1));
            
            resolve(response);
          } else {
            reject(new Error(response.message));
            toast.error(response.message);
          }
        } catch (err) {
          console.error('Erro ao marcar como lida:', err);
          reject(err);
        }
      };

      socket.once('MarkNotificationReadResponse', handleResponse);

      // Timeout
      setTimeout(() => {
        socket.off('MarkNotificationReadResponse', handleResponse);
        reject(new Error('Timeout'));
      }, 5000);
    });
  }, [socket, connected]);

  // ================================================================
  // MARK ALL AS READ
  // ================================================================

  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      // Marcar todas como lidas
      await Promise.all(
        unreadNotifications.map(notif => markAsRead(notif.id))
      );
      
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  }, [notifications, markAsRead]);

  // ================================================================
  // ADD NOTIFICATION (for real-time)
  // ================================================================

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // ================================================================
  // REAL-TIME LISTENERS
  // ================================================================

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification) => {
      addNotification(notification);
      
      // Toast baseado na prioridade
      const { title, message, priority } = notification;
      
      if (priority === 'urgent') {
        toast.error(`🚨 ${title}: ${message}`, { duration: 8000 });
      } else if (priority === 'high') {
        toast.success(`⭐ ${title}: ${message}`, { duration: 6000 });
      } else {
        toast(`📢 ${title}`, { duration: 4000 });
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, connected, addNotification]);

  // ================================================================
  // INITIAL LOAD
  // ================================================================

  useEffect(() => {
    if (connected && socket) {
      fetchNotifications();
    }
  }, [connected, socket, fetchNotifications]);

  // ================================================================
  // UTILITY FUNCTIONS
  // ================================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sale': return '💰';
      case 'refund': return '↩️';
      case 'withdrawal': return '💸';
      case 'goal_achieved': return '🎯';
      case 'affiliate': return '🤝';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-yellow-400';
      case 'normal': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return notifTime.toLocaleDateString('pt-BR');
  };

  // ================================================================
  // RETURN HOOK
  // ================================================================

  return {
    // Data
    notifications,
    unreadCount,
    unreadNotifications: notifications.filter(n => !n.read),
    
    // Loading
    loading,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    
    // Status
    connected,
    hasUnread: unreadCount > 0
  };
};