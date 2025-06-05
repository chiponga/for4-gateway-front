// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { Criptografar, Descriptografar } from '../utils/crypto';

export const useDashboard = () => {
    const [overviewData, setOverviewData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [statementData, setStatementData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState({
        overview: false,
        performance: false,
        statement: false,
        notifications: false
    });
    const [error, setError] = useState(null);

    const { socket, connected } = useSocket();

    // ================================================================
    // FETCH FUNCTIONS
    // ================================================================

    const fetchOverview = useCallback(() => {
        if (!socket || !connected) return;

        setLoading(prev => ({ ...prev, overview: true }));
        setError(null);

        const token = localStorage.getItem('token');
        const payload = Criptografar(JSON.stringify({ token: token })); // ← Agora tem token
        socket.emit('DadosDashboard', payload);

        const handleResponse = (data) => {
            try {


                const response = JSON.parse(Descriptografar(data));
                if (response.success) {
                    setOverviewData(response.data);
                } else {
                    setError(response.message);
                    toast.error(response.message);
                }
            } catch (err) {
                console.error('Erro ao processar resposta do overview:', err);
                setError('Erro ao processar dados');
            } finally {
                setLoading(prev => ({ ...prev, overview: false }));
            }
        };

        socket.once('DadosDashboardResponse', handleResponse);



        return () => {
      
            socket.off('DadosDashboardResponse', handleResponse);
        };
    }, [socket, connected]);

    const fetchPerformance = useCallback((period = '7d') => {
        if (!socket || !connected) return;

        setLoading(prev => ({ ...prev, performance: true }));
        setError(null);

        const token = localStorage.getItem('token');
        const payload = Criptografar(JSON.stringify({ period: period, token: token }));
        socket.emit('PerformanceDashboard', payload);

        const handleResponse = (data) => {
            try {
                const response = JSON.parse(Descriptografar(data));
                if (response.success) {
                    setPerformanceData(response.data);
                } else {
                    setError(response.message);
                    toast.error(response.message);
                }
            } catch (err) {
                console.error('Erro ao processar resposta de performance:', err);
                setError('Erro ao processar dados de performance');
            } finally {
                setLoading(prev => ({ ...prev, performance: false }));
            }
        };

        socket.once('PerformanceDashboardResponse', handleResponse);


        return () => {
           
            socket.off('PerformanceDashboardResponse', handleResponse);
        };
    }, [socket, connected]);

    const fetchStatement = useCallback(() => {
        if (!socket || !connected) return;

        setLoading(prev => ({ ...prev, statement: true }));
        setError(null);


        const token = localStorage.getItem('token');
        const payload = Criptografar(JSON.stringify({ token: token }));
        socket.emit('StatementDashboard', payload);

        const handleResponse = (data) => {
            try {
                const response = JSON.parse(Descriptografar(data));
                if (response.success) {
                    setStatementData(response.data);
                } else {
                    setError(response.message);
                    toast.error(response.message);
                }
            } catch (err) {
                console.error('Erro ao processar resposta do extrato:', err);
                setError('Erro ao processar dados do extrato');
            } finally {
                setLoading(prev => ({ ...prev, statement: false }));
            }
        };

        socket.once('StatementDashboardResponse', handleResponse);



        return () => {
            
            socket.off('StatementDashboardResponse', handleResponse);
        };
    }, [socket, connected]);

    const fetchNotifications = useCallback((limit = 10, unreadOnly = false) => {
        if (!socket || !connected) return;

        setLoading(prev => ({ ...prev, notifications: true }));

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
                } else {
                    toast.error(response.message);
                }
            } catch (err) {
                console.error('Erro ao processar notificações:', err);
            } finally {
                setLoading(prev => ({ ...prev, notifications: false }));
            }
        };

        socket.once('GetNotificationsResponse', handleResponse);

        const timeout = setTimeout(() => {
            socket.off('GetNotificationsResponse', handleResponse);
            setLoading(prev => ({ ...prev, notifications: false }));
        }, 10000);

        return () => {
            clearTimeout(timeout);
            socket.off('GetNotificationsResponse', handleResponse);
        };
    }, [socket, connected]);

    // ================================================================
    // ACTION FUNCTIONS
    // ================================================================

    const markNotificationRead = useCallback((notificationId) => {
        if (!socket || !connected) return;
        const token = localStorage.getItem('token');
        const payload = Criptografar(JSON.stringify({
            notification_id: notificationId,
            token: token
        }));


        socket.emit('MarkNotificationRead', payload);

        const handleResponse = (data) => {
            try {
                const response = JSON.parse(Descriptografar(data));
                if (response.success) {
                    // Atualizar notificação localmente
                    setNotifications(prev =>
                        prev.map(notif =>
                            notif.id === notificationId
                                ? { ...notif, read: true, read_at: new Date().toISOString() }
                                : notif
                        )
                    );
                } else {
                    toast.error(response.message);
                }
            } catch (err) {
                console.error('Erro ao marcar notificação:', err);
            }
        };

        socket.once('MarkNotificationReadResponse', handleResponse);
    }, [socket, connected]);

    const refreshAll = useCallback(() => {
        fetchOverview();
        fetchPerformance();
        fetchStatement();
        fetchNotifications();
        toast.success('📊 Dados atualizados!');
    }, [fetchOverview, fetchPerformance, fetchStatement, fetchNotifications]);

    // ================================================================
    // REAL-TIME LISTENERS
    // ================================================================

    useEffect(() => {
        if (!socket || !connected) return;

        // Listener para atualizações em tempo real
        const handleDashboardUpdate = (data) => {
            try {
                const updateData = JSON.parse(Descriptografar(data));

                // Atualizar overview se necessário
                if (updateData.overview) {
                    setOverviewData(prev => ({ ...prev, ...updateData.overview }));
                }

                // Mostrar notificação de atualização
                toast.success('📈 Dashboard atualizado em tempo real!');

                // Refresh automático dos dados após update
                setTimeout(() => {
                    fetchOverview();
                }, 1000);

            } catch (err) {
                console.error('Erro ao processar atualização:', err);
            }
        };

        // Listener para novas vendas
        const handleNewSale = (data) => {
            try {
                const saleData = JSON.parse(Descriptografar(data));

                // Mostrar notificação de venda
                toast.success(
                    `💰 Nova venda: R$ ${saleData.amount?.toFixed(2)} via ${saleData.payment_method}!`,
                    { duration: 6000 }
                );

                // Atualizar dados automaticamente
                setTimeout(() => {
                    fetchOverview();
                    fetchPerformance();
                }, 2000);

            } catch (err) {
                console.error('Erro ao processar nova venda:', err);
            }
        };

        // Listener para novas notificações
        const handleNewNotification = (data) => {
            try {
                // Adicionar nova notificação ao início da lista
                setNotifications(prev => [data, ...prev]);

                // Mostrar toast baseado na prioridade
                const toastOptions = {
                    duration: data.priority === 'high' ? 8000 : 4000
                };

                if (data.priority === 'urgent') {
                    toast.error(`🚨 ${data.title}: ${data.message}`, toastOptions);
                } else if (data.priority === 'high') {
                    toast.success(`⭐ ${data.title}: ${data.message}`, toastOptions);
                } else {
                    toast(`📢 ${data.title}: ${data.message}`, toastOptions);
                }

            } catch (err) {
                console.error('Erro ao processar nova notificação:', err);
            }
        };

        // Registrar listeners
        socket.on('dashboard_update', handleDashboardUpdate);
        socket.on('new_sale', handleNewSale);
        socket.on('new_notification', handleNewNotification);

        // Cleanup
        return () => {
            socket.off('dashboard_update', handleDashboardUpdate);
            socket.off('new_sale', handleNewSale);
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, connected, fetchOverview, fetchPerformance]);

    // ================================================================
    // INITIAL LOAD
    // ================================================================

    useEffect(() => {
        if (connected && socket) {
            // Carregar dados iniciais
            fetchOverview();
            fetchNotifications();
        }
    }, [connected, socket, fetchOverview, fetchNotifications]);

    // ================================================================
    // RETURN HOOK
    // ================================================================

    return {
        // Data
        overviewData,
        performanceData,
        statementData,
        notifications,

        // Loading states
        loading,
        isLoading: Object.values(loading).some(Boolean),

        // Error state
        error,

        // Actions
        fetchOverview,
        fetchPerformance,
        fetchStatement,
        fetchNotifications,
        markNotificationRead,
        refreshAll,

        // Computed values
        connected,
        unreadNotifications: notifications.filter(n => !n.read).length
    };
};