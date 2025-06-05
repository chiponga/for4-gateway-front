import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PieChart,
  RefreshCw,
  Users,
  ShoppingCart,
  Eye,
  Activity,
  Package,
  Bell,
  BellRing
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/UI/LoadingSkeleton';
import { useDashboard } from '../../hooks/useDashboard';
import { useNotifications } from '../../hooks/useNotifications';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Hooks personalizados
  const {
    overviewData,
    performanceData,
    statementData,
    loading,
    isLoading,
    error,
    fetchOverview,
    fetchPerformance,
    fetchStatement,
    refreshAll,
    connected
  } = useDashboard();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    hasUnread
  } = useNotifications();

  // ================================================================
  // EFFECTS
  // ================================================================

  useEffect(() => {
    if (selectedPeriod && connected && typeof fetchPerformance === 'function') {
      fetchPerformance(selectedPeriod);
    }
  }, [selectedPeriod, connected, fetchPerformance]);

  // ================================================================
  // FORMATTERS - CORRIGIDOS
  // ================================================================

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(0);
    }
    
    const numValue = Number(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.0%';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0';
    }
    return new Intl.NumberFormat('pt-BR').format(Number(value));
  };

  // ================================================================
  // HANDLERS - CORRIGIDOS
  // ================================================================

  const handleButtonClick = (callback, ...args) => {
    return (event) => {
      // Prevenir comportamento padrão
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      
      // Chamar a função callback apenas se for válida
      if (typeof callback === 'function') {
        callback(...args);
      }
    };
  };

  const handleRefreshAll = () => {
    if (typeof refreshAll === 'function') {
      refreshAll();
      toast.success('📊 Dados atualizados!');
    }
  };

  const handleQuickAction = (action) => {
    // Verificar se action é uma string válida
    if (typeof action !== 'string') {
      return;
    }
    
    switch (action) {
      case 'withdraw':
        toast.success('Redirecionando para saques...');
        break;
      case 'update':
        toast.success('Redirecionando para configurações...');
        break;
      case 'newProduct':
        toast.success('Redirecionando para produtos...');
        break;
      case 'viewAffiliates':
        toast.success('Redirecionando para afiliados...');
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = (notification) => {
    // Verificar se notification é um objeto válido
    if (!notification || typeof notification !== 'object') {
      return;
    }
    
    if (!notification.read && typeof markAsRead === 'function') {
      markAsRead(notification.id);
    }
  };

  const handlePeriodChange = (period) => {
    return (event) => {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      setSelectedPeriod(period);
    };
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllAsRead = () => {
    if (typeof markAllAsRead === 'function') {
      markAllAsRead();
    }
  };

  // ================================================================
  // DATA PROCESSING - CORRIGIDO
  // ================================================================

  // Processar dados de performance para gráficos com verificação de data
  const chartData = performanceData?.analytics?.map(item => {
    // Verificar se item.date é uma string ou objeto Date válido
    const date = new Date(item.date);
    
    // Verificação de data válida
    if (isNaN(date.getTime())) {
      console.warn('Data inválida encontrada:', item.date);
      return null;
    }

    return {
      date: format(date, 'dd/MM'),
      fullDate: format(date, 'dd/MM/yyyy'),
      revenue: Number(item.revenue) || 0,
      sales: Number(item.sales_count) || 0,
      conversions: Number(item.conversions) || 0,
      visitors: Number(item.visitors) || 0
    };
  }).filter(Boolean) || []; // Remove itens nulos

  // Dados para gráfico de pizza dos métodos de pagamento - com validação
  const paymentMethodsData = overviewData?.payment_methods ? [
    { 
      name: 'PIX', 
      value: Number(overviewData.payment_methods.pix?.percentage) || 0, 
      color: '#10b981', 
      amount: Number(overviewData.payment_methods.pix?.value) || 0 
    },
    { 
      name: 'Cartão', 
      value: Number(overviewData.payment_methods.card?.percentage) || 0, 
      color: '#3b82f6', 
      amount: Number(overviewData.payment_methods.card?.value) || 0 
    },
    { 
      name: 'Boleto', 
      value: Number(overviewData.payment_methods.boleto?.percentage) || 0, 
      color: '#f59e0b', 
      amount: Number(overviewData.payment_methods.boleto?.value) || 0 
    },
    { 
      name: 'Cripto', 
      value: Number(overviewData.payment_methods.crypto?.percentage) || 0, 
      color: '#8b5cf6', 
      amount: Number(overviewData.payment_methods.crypto?.value) || 0 
    }
  ] : [];

  // Métricas adicionais - com validação de números
  const additionalMetrics = [
    {
      title: 'Visitantes Hoje',
      value: formatNumber(overviewData?.visitors_today),
      change: '+12.5%',
      positive: true,
      icon: Users,
      color: 'bg-blue-600'
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercentage(overviewData?.conversion_rate),
      change: '+0.8%',
      positive: true,
      icon: TrendingUp,
      color: 'bg-green-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(overviewData?.average_ticket),
      change: '-2.1%',
      positive: false,
      icon: ShoppingCart,
      color: 'bg-purple-600'
    },
    {
      title: 'Produtos Ativos',
      value: formatNumber(overviewData?.active_products),
      change: '+3',
      positive: true,
      icon: Package,
      color: 'bg-yellow-600'
    }
  ];

  // ================================================================
  // LOADING STATE
  // ================================================================

  if ((loading.overview && !overviewData) || !connected) {
    return <LoadingSkeleton type="dashboard" />;
  }

  // ================================================================
  // ERROR STATE
  // ================================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-4">Erro ao carregar dados</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleButtonClick(handleRefreshAll)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações em tempo real */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Visão geral do seu negócio em tempo real</p>
            {connected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Ao vivo</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botão de Notificações */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors relative"
            >
              {hasUnread ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificações */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Notificações</h3>
                  {hasUnread && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-gray-750' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">
                            {typeof getNotificationIcon === 'function' 
                              ? getNotificationIcon(notification.type) 
                              : '📊'
                            }
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-400'} truncate`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {typeof formatNotificationTime === 'function' 
                                ? formatNotificationTime(notification.created_at)
                                : 'Agora'
                              }
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma notificação</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleButtonClick(handleRefreshAll)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={handleButtonClick(handleQuickAction, 'newProduct')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PieChart className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Resumo Financeiro Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vendas Hoje */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Vendas Hoje</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {formatCurrency(overviewData?.sales_today?.value || 0)}
          </p>
          <div className="flex items-center">
            {(Number(overviewData?.sales_today?.variation) || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={`text-sm ${
              (Number(overviewData?.sales_today?.variation) || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPercentage(Math.abs(Number(overviewData?.sales_today?.variation) || 0))} vs ontem
            </span>
          </div>
        </div>

        {/* Saldo Disponível */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Saldo Disponível</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {formatCurrency(overviewData?.available_balance || 0)}
          </p>
          <button 
            onClick={handleButtonClick(handleQuickAction, 'withdraw')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sacar agora →
          </button>
        </div>

        {/* Pendente */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Pendente</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {formatCurrency(overviewData?.pending_balance || 0)}
          </p>
          <p className="text-sm text-gray-400">
            {overviewData?.pending_count || 0} Em processamento
          </p>
        </div>

        {/* Meta de Faturamento */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Meta do Mês</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">
            {formatPercentage(overviewData?.billing_goal?.percentage || 0)}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Number(overviewData?.billing_goal?.percentage) || 0, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {formatCurrency(overviewData?.billing_goal?.current || 0)} / {formatCurrency(overviewData?.billing_goal?.target || 0)}
          </p>
        </div>
      </div>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 ${metric.color} rounded-lg`}>
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-gray-300">{metric.title}</h3>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
            <div className="flex items-center">
              {metric.positive ? (
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change} vs período anterior
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de Desempenho Principal */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Performance de Vendas</h2>
          </div>
          
          <div className="flex gap-2">
            {[
              { label: 'Hoje', value: '1d' },
              { label: '7 dias', value: '7d' },
              { label: '15 dias', value: '15d' },
              { label: '30 dias', value: '30d' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={handlePeriodChange(period.value)}
                disabled={loading.performance}
                className={`px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading.performance ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Carregando dados de performance...</p>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : formatNumber(value),
                    name === 'revenue' ? 'Faturamento' : name === 'sales' ? 'Vendas' : name
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return `Data: ${payload[0].payload.fullDate}`;
                    }
                    return label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum dado de performance disponível</p>
                <button
                  onClick={handleButtonClick(() => fetchPerformance && fetchPerformance(selectedPeriod))}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row com Métodos de Pagamento e Gráfico de Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métodos de Pagamento */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center gap-3">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Métodos de Pagamento</h2>
          </div>

          <div className="p-6">
            {paymentMethodsData.some(m => m.value > 0) ? (
              <>
                <div className="flex justify-center mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={paymentMethodsData.filter(m => m.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6'
                        }}
                        formatter={(value, name, props) => [
                          `${value}% (${formatCurrency(props.payload.amount)})`,
                          name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {paymentMethodsData.filter(m => m.value > 0).map((method) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: method.color }}
                        />
                        <span className="text-gray-300">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatCurrency(method.amount)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatPercentage(method.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma venda registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Conversões */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Funil de Conversão</h2>
          </div>

          <div className="p-6">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    formatter={(value, name) => [
                      formatNumber(value),
                      name === 'visitors' ? 'Visitantes' : name === 'conversions' ? 'Conversões' : name
                    ]}
                  />
                  <Bar dataKey="visitors" fill="#3b82f6" />
                  <Bar dataKey="conversions" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Dados de conversão indisponíveis</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={handleButtonClick(handleQuickAction, 'withdraw')}
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <ArrowDownLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">Sacar Agora</h3>
          </div>
          <p className="text-green-100">
            Retire seu saldo disponível
          </p>
        </button>

        <button 
          onClick={handleButtonClick(handleQuickAction, 'newProduct')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">Novo Produto</h3>
          </div>
          <p className="text-blue-100">
            Adicione um novo produto
          </p>
        </button>

        <button 
          onClick={handleButtonClick(handleQuickAction, 'viewAffiliates')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">Ver Afiliados</h3>
          </div>
          <p className="text-purple-100">
            Gerencie seus afiliados
          </p>
        </button>

        <button 
          onClick={handleButtonClick(handleQuickAction, 'update')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-6 rounded-lg transition-colors text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold">Ver Relatórios</h3>
          </div>
          <p className="text-yellow-100">
            Análises detalhadas
          </p>
        </button>
      </div>

      {/* Click outside para fechar notificações */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;