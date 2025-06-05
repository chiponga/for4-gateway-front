import { io } from 'socket.io-client';

// URL do backend Socket.io
//depend on environment variable or default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'],
  withCredentials: true,
});

// Exporta o socket para uso no resto do aplicativo
export default socket;
