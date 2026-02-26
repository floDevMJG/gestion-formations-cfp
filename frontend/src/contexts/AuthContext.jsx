// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false
    });

    delete API.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const updateAuthState = (token, user) => {
    console.log('updateAuthState appelé avec:', { token: !!token, userEmail: user?.email, userRole: user?.role });

    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const newState = {
        isAuthenticated: true,
        user,
        token,
        loading: false
      };

      setAuthState(newState);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      sessionStorage.removeItem('formateurLoginData');

      console.log('État d\'authentification mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'état d\'authentification:', error);
    }
  };

  // Intercepteur pour gérer les erreurs
  API.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const url = error.config?.url || '';
        const onVerificationPage = typeof window !== 'undefined' && window.location && 
          (window.location.pathname.startsWith('/formateur/code') || 
           window.location.pathname.startsWith('/verify-email'));
        const skipLogout =
          url.includes('/auth/login') ||
          url.includes('/auth/verify-formateur-code') ||
          url.includes('/auth/verify-email') ||
          url.includes('/auth/register') ||
          onVerificationPage;
        if (!skipLogout) {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;
    
    try {
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      localStorage.removeItem('user');
    }

    if (token && user) {
      // Vérifier le statut de l'utilisateur (même logique que dans login)
      if (user.role === 'apprenant' && user.statut !== 'valide' && user.statut !== 'actif') {
        // Ne pas authentifier les apprenants non validés
        setAuthState({
          isAuthenticated: false,
          user,
          token: null,
          loading: false
        });
        // Supprimer le token pour éviter les connexions automatiques
        localStorage.removeItem('token');
      } else {
        // Authentifier normalement les autres utilisateurs
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false
        });
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      });
    }
  }, []);

  const login = async (email, password, codeFormateur = null) => {
    // ✅ FIX : On remet isAuthenticated à false dès le début du login
    // pour éviter que l'ancien état "true" ne déclenche une redirection
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: true
    });
    setError(null);
    
    console.log('🔐 TENTATIVE DE CONNEXION FRONTEND:');
    console.log('   Email:', email);
    console.log('   Password:', password ? '***' : 'undefined');
    console.log('   Code formateur:', codeFormateur);
    
    try {
      const bodyData = { email, password, codeFormateur };
      const response = await API.post('/auth/login', bodyData);
      const data = response.data;
      console.log('📋 Données reçues (Axios):', data);
      
      const { token, user, requiresCode } = data;
      
      // Si un code est requis pour un formateur
      if (requiresCode === true && !codeFormateur) {
        try {
          sessionStorage.setItem('formateurLoginData', JSON.stringify({ email, password }));
          const u = user || data.user;
          if (u) {
            sessionStorage.setItem('formateurUser', JSON.stringify(u));
          }
          // Fallback persistant si l'utilisateur recharge la page
          localStorage.setItem('formateurLoginData', JSON.stringify({ email, password }));
          if (u) {
            localStorage.setItem('formateurUser', JSON.stringify(u));
          }
        } catch {}
        // ✅ FIX : isAuthenticated reste false
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false
        });
        return { 
          success: false, 
          requiresCode: true,
          user: user || data.user
        };
      }
      
      if (!token || !user) {
        throw new Error('Réponse du serveur invalide');
      }
      
      // Vérifier le statut de l'utilisateur apprenant
      if (user.role === 'apprenant' && user.statut !== 'valide' && user.statut !== 'actif') {
        localStorage.setItem('user', JSON.stringify(user));
        // ✅ FIX : isAuthenticated reste false
        setAuthState({
          isAuthenticated: false,
          user,
          token: null,
          loading: false
        });
        
        if (user.statut === 'rejete' || user.statut === 'refuse') {
          return { 
            success: false, 
            error: 'Votre compte a été rejeté. Veuillez contacter l\'administrateur.',
            statut: user.statut,
            redirectTo: '/en-attente-validation'
          };
        }
        
        return { 
          success: false, 
          error: 'Votre compte est en attente de validation par l\'administrateur. Vous recevrez un email une fois votre compte validé.',
          statut: user.statut,
          redirectTo: '/en-attente-validation'
        };
      }
      
      // ✅ Connexion réussie
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('formateurLoginData');
      
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        loading: false
      });
      
      return { success: true };

    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de connexion au serveur';
      setError(errorMessage);
      // ✅ FIX : En cas d'erreur, on force isAuthenticated à false
      // et on supprime tout token existant pour éviter une redirection parasite
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false
      });
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  // Fonction d'inscription
  const register = async (formData) => {
    try {
      setError('');
      setAuthState(prev => ({ ...prev, loading: true }));
      let payload = formData;

      if (typeof FormData !== 'undefined' && formData instanceof FormData) {
        const obj = {};
        for (const [key, value] of formData.entries()) {
          if (key === 'photo') continue;
          obj[key] = value;
        }
        payload = obj;
      }

      console.log('📤 Envoi de la demande d\'inscription:', payload);
      const response = await API.post('/auth/register', payload);
      console.log('📥 Réponse de l\'inscription:', response.data);
      
      // Ne jamais authentifier automatiquement un apprenant après inscription
      // Il doit attendre la validation admin
      if (formData.role === 'apprenant') {
        return { 
          success: true, 
          data: response.data,
          message: 'Inscription réussie. En attente de validation administrative.'
        };
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Échec de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        error,
        login,
        logout,
        register,
        updateAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
