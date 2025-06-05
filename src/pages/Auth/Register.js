import React, { useState } from 'react';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = (path) => {
    window.location.href = path;
  };
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    cnpj: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCNPJ = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleCNPJChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({
      ...prev,
      cnpj: formatted
    }));
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert('Você deve aceitar os termos de serviço e política de privacidade.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      //Simular chamada da API - substitua pela função register do useAuth
      const result = await register(formData);

      console.log(result)
      if (result.success) {
        
        setTimeout(() => {
        setLoading(false);
        alert('Cadastro realizado com sucesso! Redirecionando para login...');
        navigate('/login');
      }, 2000);
      }
      
      // Simulação temporária
      
      
    } catch (error) {
      console.error('Erro no registro:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">F4</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Crie sua conta
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Digite seu email"
                autoComplete="email"
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Nome da empresa */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                Nome da empresa
              </label>
              <input
                id="companyName"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Digite o nome da empresa"
                autoComplete="organization"
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* CNPJ */}
            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-300 mb-2">
                CNPJ
              </label>
              <input
                id="cnpj"
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                maxLength="18"
                autoComplete="off"
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Número de telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Telefone
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength="15"
                autoComplete="tel"
                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha (mínimo 6 caracteres)"
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha novamente"
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox de termos */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                Eu li e aceito os{' '}
                <a href="#" className="text-blue-400 underline hover:text-blue-300">
                  termos de serviço
                </a>
                {' '}e{' '}
                <a href="#" className="text-blue-400 underline hover:text-blue-300">
                  política de privacidade
                </a>
                .
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !acceptedTerms}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Criar conta
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;