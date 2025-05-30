import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'pending': {
        label: 'Pendente',
        classes: 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50'
      },
      'processing': {
        label: 'Processando',
        classes: 'bg-blue-900/20 text-blue-400 border-blue-700/50'
      },
      'completed': {
        label: 'Concluído',
        classes: 'bg-green-900/20 text-green-400 border-green-700/50'
      },
      'failed': {
        label: 'Falhou',
        classes: 'bg-red-900/20 text-red-400 border-red-700/50'
      }
    };
    
    return configs[status] || {
      label: status,
      classes: 'bg-gray-900/20 text-gray-400 border-gray-700/50'
    };
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;