// src/components/UI/SaleNotification.js
import React from 'react';
import { DollarSign, CreditCard, Banknote, Smartphone } from 'lucide-react';

const SaleNotification = ({ sale }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'pix':
        return <Smartphone className="w-4 h-4 text-green-400" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'boleto':
        return <Banknote className="w-4 h-4 text-yellow-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPaymentLabel = (method) => {
    const labels = {
      pix: 'PIX',
      card: 'Cartão',
      boleto: 'Boleto'
    };
    return labels[method] || method;
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
      <div className="p-2 bg-green-600 rounded-full">
        <DollarSign className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-white">Nova Venda!</h4>
          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
            Ao vivo
          </span>
        </div>
        <p className="text-sm text-gray-300">
          {formatCurrency(sale.amount)} • {sale.product}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {getPaymentIcon(sale.method)}
          <span className="text-xs text-gray-400">
            {getPaymentLabel(sale.method)} • {sale.customer}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SaleNotification;