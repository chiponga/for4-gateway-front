import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  action = null,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto w-16 h-16 text-gray-500 mb-4">
          <Icon className="w-full h-full" />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{message}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;