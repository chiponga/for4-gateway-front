// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiMethods } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está logado ao iniciar a aplicação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiMethods.auth.verify();
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        // Token inválido, limpar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      // Token inválido ou erro na verificação
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.error('Erro na verificação de autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiMethods.auth.login(credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Atualizar estado
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success(`Bem-vindo, ${user.name}!`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro no login';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiMethods.auth.register(userData);
      
      if (response.data.success) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro no cadastro';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Limpar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpar estado
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logout realizado com sucesso!');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await apiMethods.auth.forgotPassword(email);
      
      if (response.data.success) {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao enviar email de recuperação';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      const response = await apiMethods.auth.resetPassword(token, password);
      
      if (response.data.success) {
        toast.success('Senha alterada com sucesso! Faça login com sua nova senha.');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao alterar senha';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};