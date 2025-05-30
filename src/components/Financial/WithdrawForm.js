// src/components/Financial/WithdrawForm.js
import React, { useState } from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const WithdrawForm = ({ availableBalance, bankAccounts, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    bank_account_id: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    } else if (parseFloat(formData.amount) > availableBalance) {
      newErrors.amount = 'Valor não pode ser maior que o saldo disponível';
    } else if (parseFloat(formData.amount) < 10) {
      newErrors.amount = 'Valor mínimo para saque é R$ 10,00';
    }
    
    if (!formData.bank_account_id) {
      newErrors.bank_account_id = 'Selecione uma conta bancária';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Saque solicitado com sucesso!');
      onSuccess();
    } catch (error) {
      toast.error('Erro ao processar saque');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
    setFormData(prev => ({ ...prev, amount: value }));
    
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const suggestedAmounts = [100, 500, 1000, availableBalance].filter(amount => amount <= availableBalance);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Saldo Disponível */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium text-blue-300">Saldo Disponível</h3>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(availableBalance)}
        </p>
        <p className="text-sm text-blue-200 mt-1">
          Disponível para saque imediatamente
        </p>
      </div>

      {/* Valor do Saque */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Valor para saque
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.amount}
            onChange={handleAmountChange}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="0,00"
            required
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            BRL
          </span>
        </div>
        {errors.amount && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{errors.amount}</span>
          </div>
        )}
        
        {/* Valores Sugeridos */}
        <div className="flex gap-2 mt-3">
          <span className="text-sm text-gray-400">Sugestões:</span>
          {suggestedAmounts.slice(0, 3).map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs text-white rounded transition-colors"
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>

      {/* Conta Bancária */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Conta bancária de destino
        </label>
        <select
          value={formData.bank_account_id}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, bank_account_id: e.target.value }));
            if (errors.bank_account_id) {
              setErrors(prev => ({ ...prev, bank_account_id: '' }));
            }
          }}
          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.bank_account_id ? 'border-red-500' : 'border-gray-600'
          }`}
          required
        >
          <option value="">Selecione uma conta</option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.bank_name} - {account.account_type === 'checking' ? 'CC' : 'CP'} ***{account.account_number?.slice(-4)}
            </option>
          ))}
        </select>
        {errors.bank_account_id && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{errors.bank_account_id}</span>
          </div>
        )}
      </div>

      {/* Descrição (Opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Motivo do saque..."
          rows={3}
          maxLength={200}
        />
        <p className="text-xs text-gray-400 mt-1">
          {formData.description.length}/200 caracteres
        </p>
      </div>

      {/* Informações Importantes */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-300 mb-2">Informações Importantes</h4>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Saques são processados em até 2 dias úteis</li>
              <li>• Valor mínimo: R$ 10,00</li>
              <li>• Não cobramos taxa para saques</li>
              <li>• Você receberá uma confirmação por email</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resumo do Saque */}
      {formData.amount && parseFloat(formData.amount) > 0 && (
        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-green-300">Resumo do Saque</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-200">Valor solicitado:</span>
              <span className="text-white font-semibold">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Taxa:</span>
              <span className="text-white font-semibold">R$ 0,00</span>
            </div>
            <div className="flex justify-between border-t border-green-700/50 pt-2">
              <span className="text-green-200">Valor a receber:</span>
              <span className="text-white font-bold text-lg">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !formData.amount || !formData.bank_account_id}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Solicitar Saque'
          )}
        </button>
      </div>
    </form>
  );
};

export default WithdrawForm;