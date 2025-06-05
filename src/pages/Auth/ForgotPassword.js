import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  

  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      alert('Por favor, digite seu email');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Email Enviado!
            </h2>
            <p className="text-gray-400 mb-8">
              Se este email estiver cadastrado, você receberá as instruções de recuperação.
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-blue-300 mb-3">Próximos passos:</h3>
            <ul className="text-sm text-blue-200 space-y-2">
              <li>• Verifique sua caixa de entrada</li>
              <li>• Clique no link de recuperação</li>
              <li>• O link expira em 1 hora</li>
              <li>• Verifique também a pasta de spam</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Tentar outro email
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">F4</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Esqueci minha senha
          </h2>
          <p className="text-gray-400">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              autoComplete="email"
              className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Enviar instruções
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao login
            </button>
          </div>

          <div className="mt-6 p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
            <p className="text-sm text-orange-200">
              <strong>Lembre-se:</strong> Verifique sua caixa de spam se não receber o email em alguns minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;