// src/pages/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Package
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
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { apiMethods } from '../../services/api';
import LoadingSkeleton from '../../components/UI/LoadingSkeleton';
import { useSocket } from '../../contexts/SocketContext';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [realTimeData, setRealTimeData] = useState(null);
  const { socket, connected } = useSocket();

  // Buscar dados do overview
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiMethods.dashboard.overview(),
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Buscar dados de performance
  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = useQuery({
    queryKey: ['dashboard-performance', selectedPeriod],
    queryFn: () => apiMethods.dashboard.performance(selectedPeriod),
  });

  // Socket.IO listeners para atualizações em tempo real
  useEffect(() => {
    if (socket && connected) {
      socket.on('dashboard_update', (data) => {
        setRealTimeData(data);
        toast.success('📊 Dados atualizados em tempo real!');
        refetchOverview();
      });

      socket.on('new_sale', (data) => {
        // Usar notificação personalizada se disponível, senão toast
        if (window.showSaleNotification) {
          window.showSaleNotification(data);
        } else {
          toast.success(`💰 Nova venda: ${formatCurrency(data.amount)}`);
        }
        
        refetchOverview();
        refetchPerformance();
      });

      return () => {
        socket.off('dashboard_update');
        socket.off('new_sale');
      };
    }
  }, [socket, connected, refetchOverview, refetchPerformance]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  // Gerar dados de exemplo mais realistas
  const generateChartData = (period) => {
    const days = period === '30d' ? 30 : period === '15d' ? 15 : period === '7d' ? 7 : 1;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const baseRevenue = 1000 + Math.random() * 3000;
      const baseSales = 10 + Math.random() * 40;
      
      data.push({
        date: format(date, 'dd/MM'),
        fullDate: format(date, 'dd/MM/yyyy'),
        revenue: Math.round(baseRevenue),
        sales: Math.round(baseSales),
        conversions: Math.round(baseSales * 0.7),
        visitors: Math.round(baseSales * 15)
      });
    }
    
    return data;
  };

  const handleRefreshAll = () => {
    refetchOverview();
    refetchPerformance();
    toast.success('Dados atualizados!');
  };

  const handleQuickAction = (action) => {
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

  if (overviewLoading && !overviewData) {
    return <LoadingSkeleton rows={6} />;
  }

  const overview = overviewData?.data || {};
  const chartData = generateChartData(selectedPeriod);

  // Dados para o gráfico de pizza dos métodos de pagamento
  const paymentMethodsData = [
    { 
      name: 'PIX', 
      value: overview.payment_methods?.pix?.percentage || 45, 
      color: '#10b981', 
      amount: overview.payment_methods?.pix?.value || 3825.23 
    },
    { 
      name: 'Cartão', 
      value: overview.payment_methods?.card?.percentage || 35, 
      color: '#3b82f6', 
      amount: overview.payment_methods?.card?.value || 2975.17 
    },
    { 
      name: 'Boleto', 
      value: overview.payment_methods?.boleto?.percentage || 15, 
      color: '#f59e0b', 
      amount: overview.payment_methods?.boleto?.value || 1275.07 
    },
    { 
      name: 'Cripto', 
      value: overview.payment_methods?.crypto?.percentage || 5, 
      color: '#8b5cf6', 
      amount: overview.payment_methods?.crypto?.value || 425.02 
    }
  ];

  // Métricas adicionais
  const additionalMetrics = [
    {
      title: 'Visitantes Hoje',
      value: '1,234',
      change: '+12.5%',
      positive: true,
      icon: Users,
      color: 'bg-blue-600'
    },
    {
      title: 'Taxa de Conversão',
      value: '3.2%',
      change: '+0.8%',
      positive: true,
      icon: TrendingUp,
      color: 'bg-green-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(234.50),
      change: '-2.1%',
      positive: false,
      icon: ShoppingCart,
      color: 'bg-purple-600'
    },
    {
      title: 'Produtos Ativos',
      value: '47',
      change: '+3',
      positive: true,
      icon: Package,
      color: 'bg-yellow-600'
    }
  ];

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
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          <button
            onClick={() => handleQuickAction('newProduct')}
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
            {formatCurrency(overview.sales_today?.value || 1250.50)}
          </p>
          <div className="flex items-center">
            {(overview.sales_today?.variation || 12.5) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
            )}
            <span className={`text-sm ${
              (overview.sales_today?.variation || 12.5) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatPercentage(Math.abs(overview.sales_today?.variation || 12.5))} vs ontem
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
            {formatCurrency(overview.available_balance || 5432.10)}
          </p>
          <button 
            onClick={() => handleQuickAction('withdraw')}
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
            {formatCurrency(overview.pending_balance || 890.75)}
          </p>
          <p className="text-sm text-gray-400">
            {overview.pending_count || 5} Em processamento
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
            {formatPercentage(overview.billing_goal?.percentage || 85)}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overview.billing_goal?.percentage || 85, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {formatCurrency(overview.billing_goal?.current || 8500)} / {formatCurrency(overview.billing_goal?.target || 10000)}
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
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
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
          {performanceLoading ? (
            <div className="h-80 flex items-center justify-center">
              <LoadingSkeleton />
            </div>
          ) : (
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
            <div className="flex justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={paymentMethodsData}
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
              {paymentMethodsData.map((method) => (
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
          </div>
        </div>

        {/* Gráfico de Conversões */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Funil de Conversão</h2>
          </div>

          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-7)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="date"
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
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => handleQuickAction('withdraw')}
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
          onClick={() => handleQuickAction('newProduct')}
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
          onClick={() => handleQuickAction('viewAffiliates')}
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
          onClick={() => handleQuickAction('update')}
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
    </div>
  );
};

export default Dashboard;