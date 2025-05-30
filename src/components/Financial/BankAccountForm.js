// src/components/Financial/BankAccountForm.js
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Building, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BankAccountForm = ({ bankAccounts, onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState(bankAccounts || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    bank_code: '',
    agency: '',
    account_number: '',
    account_type: 'checking',
    holder_name: '',
    holder_document: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const banksList = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '237', name: 'Bradesco' },
    { code: '341', name: 'Itaú' },
    { code: '033', name: 'Santander' },
    { code: '260', name: 'Nu Pagamentos (Nubank)' },
    { code: '077', name: 'Banco Inter' },
    { code: '212', name: 'Banco Original' },
    { code: '290', name: 'PagSeguro' },
    { code: '323', name: 'Mercado Pago' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAccount.bank_name) newErrors.bank_name = 'Banco é obrigatório';
    if (!newAccount.agency) newErrors.agency = 'Agência é obrigatória';
    if (!newAccount.account_number) newErrors.account_number = 'Conta é obrigatória';
    if (!newAccount.holder_name) newErrors.holder_name = 'Nome do titular é obrigatório';
    if (!newAccount.holder_document) newErrors.holder_document = 'CPF/CNPJ é obrigatório';
    
    if (newAccount.holder_document) {
      const doc = newAccount.holder_document.replace(/\D/g, '');
      if (doc.length !== 11 && doc.length !== 14) {
        newErrors.holder_document = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const account = {
        id: Date.now(),
        ...newAccount,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      setAccounts(prev => [...prev, account]);
      setNewAccount({
        bank_name: '',
        bank_code: '',
        agency: '',
        account_number: '',
        account_type: 'checking',
        holder_name: '',
        holder_document: ''
      });
      setShowAddForm(false);
      setErrors({});
      
      toast.success('Conta bancária adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar conta bancária');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta conta bancária?')) {
      return;
    }
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast.success('Conta bancária removida');
    } catch (error) {
      toast.error('Erro ao remover conta bancária');
    }
  };

  const handleBankSelect = (bankCode, bankName) => {
    setNewAccount(prev => ({
      ...prev,
      bank_code: bankCode,
      bank_name: bankName
    }));
    if (errors.bank_name) {
      setErrors(prev => ({ ...prev, bank_name: '' }));
    }
  };

  const formatDocument = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Contas Bancárias</h3>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie suas contas para recebimento de saques
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Conta
          </button>
        )}
      </div>

      {/* Lista de contas */}
      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-lg font-medium text-gray-300">Nenhuma conta cadastrada</p>
            <p className="text-sm">Adicione uma conta bancária para receber seus saques</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{account.bank_name}</h4>
                    <p className="text-sm text-gray-400">
                      {account.account_type === 'checking' ? 'Conta Corrente' : 'Poupança'} • 
                      Ag: {account.agency} • 
                      Conta: ***{account.account_number?.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.holder_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Ativa</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAccount(account.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                    title="Remover conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulário de adição */}
      {showAddForm && (
        <div className="bg-gray-700 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-white">Nova Conta Bancária</h4>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewAccount({
                  bank_name: '',
                  bank_code: '',
                  agency: '',
                  account_number: '',
                  account_type: 'checking',
                  holder_name: '',
                  holder_document: ''
                });
                setErrors({});
              }}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddAccount} className="space-y-4">
            {/* Banco */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Banco *
              </label>
              <select
                value={newAccount.bank_code}
                onChange={(e) => {
                  const selectedBank = banksList.find(bank => bank.code === e.target.value);
                  if (selectedBank) {
                    handleBankSelect(selectedBank.code, selectedBank.name);
                  }
                }}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.bank_name ? 'border-red-500' : 'border-gray-500'
                }`}
                required
              >
                <option value="">Selecione o banco</option>
                {banksList.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.code} - {bank.name}
                  </option>
                ))}
              </select>
              {errors.bank_name && (
                <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.bank_name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agência */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agência *
                </label>
                <input
                  type="text"
                  value={newAccount.agency}
                  onChange={(e) => {
                    setNewAccount(prev => ({ ...prev, agency: e.target.value }));
                    if (errors.agency) setErrors(prev => ({ ...prev, agency: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.agency ? 'border-red-500' : 'border-gray-500'
                  }`}
                  placeholder="0000"
                  maxLength={10}
                  required
                />
                {errors.agency && (
                  <span className="text-xs text-red-400">{errors.agency}</span>
                )}
              </div>

              {/* Conta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número da Conta *
                </label>
                <input
                  type="text"
                  value={newAccount.account_number}
                  onChange={(e) => {
                    setNewAccount(prev => ({ ...prev, account_number: e.target.value }));
                    if (errors.account_number) setErrors(prev => ({ ...prev, account_number: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.account_number ? 'border-red-500' : 'border-gray-500'
                  }`}
                  placeholder="00000-0"
                  maxLength={15}
                  required
                />
                {errors.account_number && (
                  <span className="text-xs text-red-400">{errors.account_number}</span>
                )}
              </div>
            </div>

            {/* Tipo de Conta */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Conta *
              </label>
              <select
                value={newAccount.account_type}
                onChange={(e) => setNewAccount(prev => ({ ...prev, account_type: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
              </select>
            </div>

            {/* Nome do Titular */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Titular *
              </label>
              <input
                type="text"
                value={newAccount.holder_name}
                onChange={(e) => {
                  setNewAccount(prev => ({ ...prev, holder_name: e.target.value }));
                  if (errors.holder_name) setErrors(prev => ({ ...prev, holder_name: '' }));
                }}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.holder_name ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="Nome completo do titular"
                required
              />
              {errors.holder_name && (
                <span className="text-xs text-red-400">{errors.holder_name}</span>
              )}
            </div>

            {/* CPF/CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CPF/CNPJ do Titular *
              </label>
              <input
                type="text"
                value={formatDocument(newAccount.holder_document)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setNewAccount(prev => ({ ...prev, holder_document: value }));
                  if (errors.holder_document) setErrors(prev => ({ ...prev, holder_document: '' }));
                }}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.holder_document ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                maxLength={18}
                required
              />
              {errors.holder_document && (
                <span className="text-xs text-red-400">{errors.holder_document}</span>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar Conta'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="flex gap-3 pt-4 border-t border-gray-600">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default BankAccountForm;