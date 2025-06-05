// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Criptografar, Descriptografar } from '../utils/crypto';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Conectar ao socket apenas se autenticado
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        withCredentials: true,           // <— permite cookies/credenciais
        transports: ['websocket'],
      });

      // Event listeners
      newSocket.on('connect', () => {
        console.log('🔌 Socket conectado:', newSocket.id);
        setConnected(true);

        // Entrar na sala do usuário
        newSocket.emit('join_user_room', user.id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket desconectado:', reason);
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Erro na conexão do socket:', error);
        setConnected(false);
      });

      // Eventos de negócio
      newSocket.on('payment_created', (data) => {
        toast.success(`💰 Novo pagamento: ${data.amount}`);

        try {
          const payload = Descriptografar(data);
          toast.success(`💰 Novo pagamento: ${payload.amount}`);
        } catch (err) {
          console.error('Erro ao descriptografar payment_created:', err);
        }
        // Aqui você pode atualizar o estado global ou invalidar queries
      });

      newSocket.on('payment_paid', (data) => {
        toast.success(`✅ Pagamento confirmado: ${data.amount}`);
      });

      newSocket.on('payment_failed', (data) => {
        toast.error(`❌ Pagamento falhou: ${data.amount}`);
      });

      newSocket.on('new_affiliate_request', (data) => {
        toast(`👥 Nova solicitação de afiliado: ${data.user_name}`, {
          icon: '👥',
        });
      });

      newSocket.on('withdrawal_processed', (data) => {
        toast.success(`💸 Saque processado: ${data.amount}`);
      });

      newSocket.on('commission_received', (data) => {
        toast.success(`💼 Nova comissão: ${data.amount}`);
      });

      setSocket(newSocket);

      // Cleanup na desmontagem
      return () => {
        console.log('🔌 Desconectando socket...');
        newSocket.disconnect();
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Se não autenticado, desconectar socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Função para emitir eventos
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, Criptografar(data));
    } else {
      console.warn('Socket não conectado. Não foi possível emitir evento:', event);
    }
  };

  // Função para ouvir eventos dinamicamente
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);

      // Retornar função de cleanup
      return () => socket.off(event, callback);
    }
  };

  // Função para parar de ouvir eventos
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};