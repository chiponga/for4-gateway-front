import React from 'react';
import { Package } from 'lucide-react';

const Products = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Produtos</h1>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Em desenvolvimento</h3>
        <p className="text-gray-400">A página de produtos será implementada em breve.</p>
      </div>
    </div>
  );
};

export default Products;