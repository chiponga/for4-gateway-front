// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiMethods } from '../services/api';
import toast from 'react-hot-toast';
import Socket from '../utils/Socket'
import { Criptografar, Descriptografar } from '../utils/crypto';


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

      const enviarToken = {
        token: token
      }

      Socket.emit('VerificarToken', Criptografar(JSON.stringify(enviarToken)));

      Socket.once('VerificarTokenResponse', (data) => {

        const { success, user } = JSON.parse(Descriptografar(data))

        // console.log(user)
        if (success) {

          setUser(user);
          setIsAuthenticated(true);

        } else {
          // Token inválido, limpar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      })

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

      Socket.emit('Login', Criptografar(JSON.stringify(credentials)));

      Socket.on('LoginResponse', (payload) => {
        try {
          const { success, message, token, user } = JSON.parse(Descriptografar(payload));
          setLoading(false);

          if (success) {
            // Salvar no localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            // Atualizar estado
            setUser(user);
            setIsAuthenticated(true);
            toast.success(`Bem-vindo, ${user.name}!`);
            return { success: true };

          } else {
            alert(message);
          }
        } catch (err) {

          console.error('Erro ao processar LoginResponse:', err);
          setLoading(false);
        }
      });

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

      Socket.emit('Register', Criptografar(JSON.stringify(userData)));

      return new Promise((resolve) => {
      Socket.once('RegisterResponse', (payload) => {
        try {
          const { success, message } = JSON.parse(Descriptografar(payload));
          setLoading(false);

          if (success) {
            toast.success(message || 'Conta criada com sucesso! Faça login para continuar.');
            resolve({ success: true });
          } else {
            toast.error(message || 'Erro no cadastro');
            resolve({ success: false, message });
          }
        } catch (err) {
          console.error('Erro ao processar RegisterResponse:', err);
          setLoading(false);
          toast.error('Erro ao processar resposta do servidor');
          resolve({ success: false, message: 'Erro interno' });
        }
      });
    });

    } catch (error) {
      const message = error.response?.data?.message || 'Erro no cadastro';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      Socket.off('LoginResponse');
      Socket.off('RegisterResponse');
      Socket.off('ForgotPasswordResponse');
      Socket.off('ResetPasswordResponse');
    };
  }, []);

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

      Socket.emit('ForgotPassword', Criptografar(JSON.stringify({ email })));

      return new Promise((resolve) => {
        Socket.once('ForgotPasswordResponse', (payload) => {
          try {
            const { success, message } = JSON.parse(Descriptografar(payload));
            setLoading(false);

            //console.log(success + ' ' + message)
            if (success) {
              toast.success(message || 'Email de recuperação enviado! Verifique sua caixa de entrada.');
              resolve({ success: true });
            } else {
              toast.error(message || 'Erro ao enviar email de recuperação');
              resolve({ success: false, message });
            }
          } catch (err) {
            console.error('Erro ao processar ForgotPasswordResponse:', err);
            setLoading(false);
            toast.error('Erro ao processar resposta do servidor');
            resolve({ success: false, message: 'Erro interno' });
          }
        });
      });

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

      Socket.emit('ResetPassword', Criptografar(JSON.stringify({
        token,
        password,
        confirmPassword: password
      })));

      return new Promise((resolve) => {
        Socket.once('ResetPasswordResponse', (payload) => {
          try {
            const { success, message } = JSON.parse(Descriptografar(payload));
            setLoading(false);

            if (success) {
              toast.success(message || 'Senha alterada com sucesso! Faça login com sua nova senha.');
              resolve({ success: true });
            } else {
              toast.error(message || 'Erro ao alterar senha');
              resolve({ success: false, message });
            }
          } catch (err) {
            console.error('Erro ao processar ResetPasswordResponse:', err);
            setLoading(false);
            toast.error('Erro ao processar resposta do servidor');
            resolve({ success: false, message: 'Erro interno' });
          }
        });
      });

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