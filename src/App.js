// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Páginas
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Financial from './pages/Financial';
import Products from './pages/Products';
import Marketplace from './pages/Marketplace';
import Affiliates from './pages/Affiliates';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Componentes UI
import NotificationContainer from './components/UI/NotificationContainer';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rotas públicas
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente principal das rotas
const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Rotas protegidas */}
      <Route
        path="/forgotPassword"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />



      <Route
        path="/financial"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Financial />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Marketplace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/affiliates"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Affiliates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Integrations />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Rota raiz */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Rota 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404</h1>
              <p className="text-gray-400 mb-6">Página não encontrada</p>
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// Componente principal da aplicação
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <AppRoutes />

              {/* Sistema de Notificações */}
              <NotificationContainer />

              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#f3f4f6',
                    border: '1px solid #374151',
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;