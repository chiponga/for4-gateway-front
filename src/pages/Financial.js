// src/pages/Financial.js
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  Calendar,
  Filter,
  Download,
  Plus,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Smartphone,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { apiMethods } from '../services/api';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import EmptyState from '../components/UI/EmptyState';
import Modal from '../components/UI/Modal';
import StatusBadge from '../components/UI/StatusBadge';
import WithdrawForm from '../components/Financial/WithdrawForm';
import BankAccountForm from '../components/Financial/BankAccountForm';
import { useSocket } from '../contexts/SocketContext';

const Financial = () => {
  const [activeTab, setActiveTab] = useState('balance');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const queryClient = useQueryClient();
  const { socket, connected } = useSocket();

  // Socket listeners para atualizações em tempo real
  useEffect(() => {
    if (socket && connected) {
      socket.on('withdrawal_processed', (data) => {
        toast.success(`💸 Saque processado: ${formatCurrency(data.amount)}`);
        queryClient.invalidateQueries(['financial-balance']);
        queryClient.invalidateQueries(['financial-withdrawals']);
      });

      socket.on('payment_received', (data) => {
        toast.success(`💰 Pagamento recebido: ${formatCurrency(data.amount)}`);
        queryClient.invalidateQueries(['financial-balance']);
        queryClient.invalidateQueries(['financial-statements']);
      });

      return () => {
        socket.off('withdrawal_processed');
        socket.off('payment_received');
      };
    }
  }, [socket, connected, queryClient]);

  // Buscar saldo
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['financial-balance'],
    queryFn: () => apiMethods.financial.balance(),
    refetchInterval: 30000,
    onError: (error) => {
      toast.error('Erro ao carregar saldo');
      console.error('Balance error:', error);
    }
  });

  // Buscar extratos
  const { data: statementsData, isLoading: statementsLoading, refetch: refetchStatements } = useQuery({
    queryKey: ['financial-statements', filters, currentPage],
    queryFn: () => apiMethods.dashboard.statement({ ...filters, page: currentPage, limit: itemsPerPage }),
    onError: (error) => {
      toast.error('Erro ao carregar extratos');
      console.error('Statements error:', error);
    }
  });

  // Buscar saques
  const { data: withdrawalsData, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useQuery({
    queryKey: ['financial-withdrawals'],
    queryFn: () => apiMethods.financial.withdrawals(),
    onError: (error) => {
      toast.error('Erro ao carregar saques');
      console.error('Withdrawals error:', error);
    }
  });

  // Buscar contas bancárias
  const { data: bankAccountsData, refetch: refetchBankAccounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => apiMethods.financial.bankAccounts(),
    onError: (error) => {
      console.error('Bank accounts error:', error);
    }
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateShort = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      'payment': <ArrowUpRight className="w-4 h-4 text-green-400" />,
      'withdrawal': <ArrowDownLeft className="w-4 h-4 text-red-400" />,
      'refund': <ArrowDownLeft className="w-4 h-4 text-orange-400" />,
      'commission': <ArrowUpRight className="w-4 h-4 text-blue-400" />,
      'chargeback': <ArrowDownLeft className="w-4 h-4 text-red-400" />,
      'pix': <Smartphone className="w-4 h-4 text-green-400" />,
      'card': <CreditCard className="w-4 h-4 text-blue-400" />,
      'boleto': <Banknote className="w-4 h-4 text-yellow-400" />
    };
    return icons[type] || <DollarSign className="w-4 h-4 text-gray-400" />;
  };

  const getTransactionColor = (type) => {
    const colors = {
      'payment': 'text-green-400',
      'withdrawal': 'text-red-400',
      'refund': 'text-orange-400',
      'commission': 'text-blue-400',
      'chargeback': 'text-red-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const getTransactionLabel = (type) => {
    const labels = {
      'payment': 'Recebimento',
      'withdrawal': 'Saque',
      'refund': 'Reembolso',
      'commission': 'Comissão',
      'chargeback': 'Chargeback',
      'pix': 'PIX',
      'card': 'Cartão',
      'boleto': 'Boleto'
    };
    return labels[type] || type;
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRefreshAll = () => {
    refetchBalance();
    refetchStatements();
    refetchWithdrawals();
    refetchBankAccounts();
    toast.success('Dados atualizados!');
  };

  const handleExportData = async (type) => {
    try {
      toast.loading('Gerando arquivo...');
      
      // Simular export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success(`Arquivo ${type.toUpperCase()} baixado!`);
    } catch (error) {
      toast.error('Erro ao exportar dados');
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      search: ''
    });
    setCurrentPage(1);
  };

  const quickDateFilters = [
    { label: 'Hoje', getValue: () => ({ start_date: format(new Date(), 'yyyy-MM-dd'), end_date: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'Ontem', getValue: () => ({ start_date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), end_date: format(subDays(new Date(), 1), 'yyyy-MM-dd') }) },
    { label: 'Últimos 7 dias', getValue: () => ({ start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end_date: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'Últimos 30 dias', getValue: () => ({ start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end_date: format(new Date(), 'yyyy-MM-dd') }) },
    { label: 'Este mês', getValue: () => ({ start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) }
  ];

  const tabs = [
    { id: 'balance', label: 'Saldo', icon: DollarSign },
    { id: 'withdrawals', label: 'Histórico de Saques', icon: Banknote },
    { id: 'statements', label: 'Extrato Financeiro', icon: TrendingUp },
    { id: 'receivables', label: 'Agenda de Recebíveis', icon: Calendar }
  ];

  if (balanceLoading && !balanceData) {
    return <LoadingSkeleton rows={6} />;
  }

  const balance = balanceData?.data || {};
  const statements = statementsData?.data?.statements || [];
  const totalStatements = statementsData?.data?.total || 0;
  const withdrawals = withdrawalsData?.data || [];
  const bankAccounts = bankAccountsData?.data || [];

  // Gerar dados mock para demonstração
  const mockStatements = statements.length === 0 ? [
    {
      id: 1,
      type: 'payment',
      amount: 250.00,
      description: 'Venda do Produto X',
      method: 'pix',
      customer: 'João Silva',
      status: 'completed',
      created_at: new Date().toISOString(),
      transaction_id: 'TXN_001'
    },
    {
      id: 2,
      type: 'commission',
      amount: 45.50,
      description: 'Comissão de afiliado',
      method: 'card',
      customer: 'Maria Santos',
      status: 'completed',
      created_at: subDays(new Date(), 1).toISOString(),
      transaction_id: 'TXN_002'
    },
    {
      id: 3,
      type: 'withdrawal',
      amount: -150.00,
      description: 'Saque para conta bancária',
      method: 'transfer',
      customer: 'Sistema',
      status: 'processing',
      created_at: subDays(new Date(), 2).toISOString(),
      transaction_id: 'TXN_003'
    }
  ] : statements;

  const mockWithdrawals = withdrawals.length === 0 ? [
    {
      id: 1,
      amount: 1000.00,
      bank_account: 'Banco do Brasil - ***1234',
      status: 'completed',
      created_at: subDays(new Date(), 3).toISOString(),
      completed_at: subDays(new Date(), 1).toISOString(),
      description: 'Saque mensal'
    },
    {
      id: 2,
      amount: 500.00,
      bank_account: 'Nubank - ***5678',
      status: 'processing',
      created_at: new Date().toISOString(),
      completed_at: null,
      description: 'Saque emergencial'
    }
  ] : withdrawals;

  const mockBankAccounts = bankAccounts.length === 0 ? [
    {
      id: 1,
      bank_name: 'Banco do Brasil',
      bank_code: '001',
      agency: '1234',
      account_number: '12345-6',
      account_type: 'checking',
      holder_name: 'Admin For4',
      status: 'active'
    },
    {
      id: 2,
      bank_name: 'Nubank',
      bank_code: '260',
      agency: '0001',
      account_number: '98765-4',
      account_type: 'checking',
      holder_name: 'Admin For4',
      status: 'active'
    }
  ] : bankAccounts;

  // Calcular paginação
  const totalPages = Math.ceil(totalStatements / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStatements = mockStatements.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Gerencie seu saldo, saques e histórico financeiro</p>
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
            onClick={() => setShowBankAccountForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Contas Bancárias
          </button>
          <button
            onClick={() => setShowWithdrawForm(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Novo Saque
          </button>
        </div>
      </div>

      {/* Resumo de Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Disponível</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(balance.available || 5432.10)}
          </p>
          {balance.last_withdrawal && (
            <p className="text-sm text-gray-400 mt-1">
              Último saque: {formatDate(balance.last_withdrawal.date)}
            </p>
          )}
          <button
            onClick={() => setShowWithdrawForm(true)}
            className="text-sm text-green-400 hover:text-green-300 transition-colors mt-2"
          >
            Sacar agora →
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Pendente</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(balance.pending || 890.75)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {balance.pending_count || 3} Em processamento
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-300">Total</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency((balance.available || 5432.10) + (balance.pending || 890.75))}
          </p>
          <p className="text-sm text-green-400 mt-1">
            +{balance.growth_percentage || 12.5}% este mês
          </p>
        </div>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Contas Bancárias</span>
          </div>
          <p className="text-lg font-bold text-white">{mockBankAccounts.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Transações</span>
          </div>
          <p className="text-lg font-bold text-white">{mockStatements.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Saques</span>
          </div>
          <p className="text-lg font-bold text-white">{mockWithdrawals.length}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Taxa Sucesso</span>
          </div>
          <p className="text-lg font-bold text-white">98.5%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {/* Resumo Detalhado */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Resumo do Saldo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Saldo Disponível</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vendas aprovadas:</span>
                    <span className="text-white">{formatCurrency(balance.approved_sales || 4800.00)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comissões:</span>
                    <span className="text-white">{formatCurrency(balance.commissions || 632.10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reembolsos:</span>
                    <span className="text-red-400">-{formatCurrency(balance.refunds || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-600">
                    <span className="text-gray-300">Total disponível:</span>
                    <span className="text-green-400">{formatCurrency(balance.available || 5432.10)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Saldo Pendente</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aguardando aprovação:</span>
                    <span className="text-white">{formatCurrency(balance.pending_approval || 500.00)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Em processamento:</span>
                    <span className="text-white">{formatCurrency(balance.processing || 390.75)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-gray-600">
                    <span className="text-gray-300">Total pendente:</span>
                    <span className="text-yellow-400">{formatCurrency(balance.pending || 890.75)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowWithdrawForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowDownLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold">Sacar Agora</h3>
              </div>
              <p className="text-green-100">
                Retire seu saldo disponível para sua conta bancária
              </p>
              <p className="text-green-200 text-sm mt-2">
                Saldo disponível: {formatCurrency(balance.available || 5432.10)}
              </p>
            </button>

            <button
              onClick={() => setShowBankAccountForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold">Gerenciar Contas</h3>
              </div>
              <p className="text-blue-100">
                Adicione ou edite suas contas bancárias
              </p>
              <p className="text-blue-200 text-sm mt-2">
                {mockBankAccounts.length} conta(s) cadastrada(s)
              </p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Histórico de Saques</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportData('csv')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => setShowWithdrawForm(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova Antecipação
              </button>
            </div>
          </div>

          {withdrawalsLoading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : mockWithdrawals.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="Sem registros"
              message="Não encontramos nenhum saque na sua conta!"
              action={
                <button
                  onClick={() => setShowWithdrawForm(true)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Fazer primeiro saque
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Conta Destino
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Conclusão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {mockWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(withdrawal.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {withdrawal.bank_account}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={withdrawal.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {withdrawal.completed_at ? formatDate(withdrawal.completed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewTransaction(withdrawal)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statements' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Extrato Financeiro</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Filtros
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 space-y-4">
                  {/* Filtros Rápidos de Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Períodos rápidos
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {quickDateFilters.map((filter) => (
                        <button
                          key={filter.label}
                          onClick={() => {
                            const dates = filter.getValue();
                            setFilters(prev => ({ ...prev, ...dates }));
                          }}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Buscar
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Buscar por descrição..."
                        />
                      </div>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de transação
                      </label>
                      <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os tipos</option>
                        <option value="payment">Recebimento</option>
                        <option value="withdrawal">Saque</option>
                        <option value="refund">Reembolso</option>
                        <option value="commission">Comissão</option>
                        <option value="chargeback">Chargeback</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os status</option>
                        <option value="completed">Concluído</option>
                        <option value="processing">Processando</option>
                        <option value="pending">Pendente</option>
                        <option value="failed">Falhou</option>
                      </select>
                    </div>

                    {/* Data Inicial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Data inicial
                      </label>
                      <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Limpar filtros
                    </button>
                    <span className="text-sm text-gray-400">
                      {mockStatements.length} transação(ões) encontrada(s)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Transações */}
            {statementsLoading ? (
              <div className="p-6">
                <LoadingSkeleton />
              </div>
            ) : paginatedStatements.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="Sem registros"
                message="Não encontramos nenhuma transação na sua conta!"
              />
            ) : (
              <>
                <div className="divide-y divide-gray-700">
                  {paginatedStatements.map((statement) => (
                    <div
                      key={statement.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-600 rounded-lg">
                          {getTransactionIcon(statement.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {getTransactionLabel(statement.type)}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {statement.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-gray-500 text-xs">
                              {formatDate(statement.created_at)}
                            </p>
                            {statement.customer && (
                              <p className="text-gray-500 text-xs">
                                {statement.customer}
                              </p>
                            )}
                            {statement.method && (
                              <div className="flex items-center gap-1">
                                {getTransactionIcon(statement.method)}
                                <span className="text-gray-500 text-xs">
                                  {getTransactionLabel(statement.method)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(statement.type)}`}>
                          {statement.type === 'withdrawal' || statement.type === 'refund' || statement.type === 'chargeback' ? '-' : '+'}
                          {formatCurrency(Math.abs(statement.amount))}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={statement.status} />
                          <button
                            onClick={() => handleViewTransaction(statement)}
                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="p-6 border-t border-gray-700 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, totalStatements)} de {totalStatements} resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-400">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'receivables' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Agenda de Recebíveis</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-medium text-blue-400">Informações sobre valores futuros a serem recebidos</h3>
              </div>
              <p className="text-sm text-gray-300">
                Aqui você poderá visualizar quando seus valores pendentes serão liberados para saque.
              </p>
            </div>

            {/* Agenda Mock */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Próximos Recebimentos</h4>
              {[
                { date: format(new Date(), 'yyyy-MM-dd'), amount: 450.00, description: 'Liberação automática - Vendas D-2' },
                { date: format(subDays(new Date(), -1), 'yyyy-MM-dd'), amount: 320.75, description: 'Liberação automática - Vendas D-3' },
                { date: format(subDays(new Date(), -3), 'yyyy-MM-dd'), amount: 120.00, description: 'Comissão de afiliado' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{formatDateShort(item.date)}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-gray-400">Previsão</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={showWithdrawForm}
        onClose={() => setShowWithdrawForm(false)}
        title="Novo Saque"
        size="md"
      >
        <WithdrawForm
          availableBalance={balance.available || 5432.10}
          bankAccounts={mockBankAccounts}
          onClose={() => setShowWithdrawForm(false)}
          onSuccess={() => {
            setShowWithdrawForm(false);
            queryClient.invalidateQueries(['financial-balance']);
            queryClient.invalidateQueries(['financial-withdrawals']);
          }}
        />
      </Modal>

      <Modal
        isOpen={showBankAccountForm}
        onClose={() => setShowBankAccountForm(false)}
        title="Contas Bancárias"
        size="lg"
      >
        <BankAccountForm
          bankAccounts={mockBankAccounts}
          onClose={() => setShowBankAccountForm(false)}
          onSuccess={() => {
            setShowBankAccountForm(false);
            queryClient.invalidateQueries(['bank-accounts']);
          }}
        />
      </Modal>

      <Modal
        isOpen={showTransactionDetails}
        onClose={() => setShowTransactionDetails(false)}
        title="Detalhes da Transação"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo
                </label>
                <p className="text-white">{getTransactionLabel(selectedTransaction.type)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Valor
                </label>
                <p className={`font-semibold ${getTransactionColor(selectedTransaction.type)}`}>
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Descrição
              </label>
              <p className="text-white">{selectedTransaction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <StatusBadge status={selectedTransaction.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data
                </label>
                <p className="text-white">{formatDate(selectedTransaction.created_at)}</p>
              </div>
            </div>

            {selectedTransaction.customer && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cliente
                </label>
                <p className="text-white">{selectedTransaction.customer}</p>
              </div>
            )}

            {selectedTransaction.transaction_id && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID da Transação
                </label>
                <p className="text-white font-mono text-sm">{selectedTransaction.transaction_id}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Financial;