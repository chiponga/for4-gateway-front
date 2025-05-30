import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ShoppingBag,
  Package,
  CreditCard,
  Store,
  Users,
  Zap,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  // Menu items da barra lateral
  const menuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      color: 'text-blue-400'
    },
    {
      name: 'Financeiro',
      icon: CreditCard,
      path: '/financial',
      color: 'text-green-400'
    },
    {
      name: 'Produtos',
      icon: Package,
      path: '/products',
      color: 'text-purple-400'
    },
    {
      name: 'Integrações',
      icon: Zap,
      path: '/integrations',
      color: 'text-yellow-400'
    },
    {
      name: 'Marketplace',
      icon: Store,
      path: '/marketplace',
      color: 'text-pink-400'
    },
    {
      name: 'Indique e Ganhe',
      icon: Users,
      path: '/affiliates',
      color: 'text-orange-400',
      submenu: [
        { name: 'Meus Afiliados', path: '/affiliates/my-affiliates' }
      ]
    },
    {
      name: 'Área de Membros',
      icon: ShoppingBag,
      path: '/members',
      color: 'text-cyan-400'
    },
    {
      name: 'Configurações',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-400'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Aqui você implementaria a lógica de mudança de tema
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        <div className={`flex flex-col h-full ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r`}>
          
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F4</span>
              </div>
              <span className={`font-bold text-xl ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                For4
              </span>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 pb-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    isActive(item.path) ? 'text-white' : item.color
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </button>

                {/* Submenu */}
                {item.submenu && isActive(item.path) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.name}
                        onClick={() => {
                          navigate(subItem.path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          location.pathname === subItem.path
                            ? 'text-blue-400'
                            : darkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {subItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer da Sidebar */}
          <div className="p-4 border-t border-gray-700">
            {/* Tema Claro/Escuro */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-3 transition-colors ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-blue-400" />
              )}
              <span className="text-sm">
                {darkMode ? 'Tema Claro' : 'Tema Escuro'}
              </span>
            </button>

            {/* Usuário */}
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name}
                </p>
                <p className={`text-xs truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="w-full pl-5 pr-5">
        {/* Header */}
        <header className={`${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Status de Conexão */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notificações */}
              <button className="relative text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Suporte */}
              <button className="text-gray-400 hover:text-gray-600">
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;