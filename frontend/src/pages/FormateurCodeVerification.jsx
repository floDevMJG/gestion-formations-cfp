import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function FormateurCodeVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateAuthState } = useAuth();
  
  // États
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const isMaxAttemptsReached = attempts >= maxAttempts;

  // Initialisation du composant
  useEffect(() => {
    const initialize = () => {
      // 1. Vérifier si on a un utilisateur dans le state de navigation
      if (location.state?.user) {
        setUser(location.state.user);
        setIsInitialized(true);
        return;
      }

      // 2. Sinon, vérifier dans le sessionStorage (ou localStorage en fallback)
      const storedUser = sessionStorage.getItem('formateurUser') || localStorage.getItem('formateurUser');
      const loginData = sessionStorage.getItem('formateurLoginData') || localStorage.getItem('formateurLoginData');
      
      if (storedUser && loginData) {
        try {
          setUser(JSON.parse(storedUser));
          setIsInitialized(true);
          return;
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }

      // 3. Si aucune donnée valide, afficher un message sans redirection immédiate
      setError('Session expirée. Veuillez vous reconnecter depuis la page de connexion formateur.');
      setIsInitialized(true);
    };

    initialize();
  }, [location.state]);

  // Gestion du retour à la page de connexion
  const handleBackToLogin = useCallback(() => {
    // Nettoyage complet des données de session
    sessionStorage.removeItem('formateurLoginData');
    sessionStorage.removeItem('formateurUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirection avec rechargement pour s'assurer d'un état propre
    window.location.href = '/login';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier le nombre de tentatives
    if (isMaxAttemptsReached) {
      setError('Nombre maximum de tentatives atteint. Retour à la page de connexion.');
      setTimeout(() => {
        handleBackToLogin();
      }, 1200);
      return;
    }
    
    setError('');
    
    // Vérifier que le code n'est pas vide
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Veuillez entrer un code de vérification');
      return;
    }
    
    // Vérifier le format du code (optionnel)
    const codePattern = /^[A-Z0-9-]+$/; // Format plus flexible
    if (!codePattern.test(trimmedCode)) {
      setError('Format de code invalide');
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Données de session:', {
        formateurLoginData: sessionStorage.getItem('formateurLoginData'),
        formateurUser: sessionStorage.getItem('formateurUser')
      });

      // Récupérer les données de connexion depuis le sessionStorage (ou localStorage)
      const loginData = sessionStorage.getItem('formateurLoginData') || localStorage.getItem('formateurLoginData');
      if (!loginData) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setIsLoading(false);
        return;
      }

      let userData;
      try {
        userData = JSON.parse(loginData);
        console.log('Données utilisateur parsées:', userData);
      } catch (parseError) {
        console.error('Erreur lors du parsing des données utilisateur:', parseError);
        throw new Error('Erreur de session. Veuillez vous reconnecter.');
      }

      let { email, password } = userData;
      if (!email) {
        try {
          const fallbackUserStr = sessionStorage.getItem('formateurUser') || localStorage.getItem('formateurUser');
          if (fallbackUserStr) {
            const fallbackUser = JSON.parse(fallbackUserStr);
            if (fallbackUser?.email) {
              email = fallbackUser.email;
            }
          }
        } catch {}
      }
      if (!email) {
        console.error('Email manquant dans les données de session');
        throw new Error('Email manquant. Veuillez vous reconnecter.');
      }

      console.log('Tentative de connexion avec:', { email, code });

      try {
        // Essayer d'abord de se connecter directement avec le code (si mot de passe connu)
        if (password) {
          const loginResponse = await API.post('/auth/login', {
            email,
            password,
            codeFormateur: code.trim()
          });

          console.log('Réponse de connexion:', loginResponse.data);

          if (loginResponse.data.token) {
            const { token, user } = loginResponse.data;

            // Sauvegarder les informations d'authentification
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Mettre à jour le contexte d'authentification
            updateAuthState(token, user);
            
            // Afficher le message de succès
            setIsSuccess(true);
            
            // Nettoyer les données temporaires
            sessionStorage.removeItem('formateurLoginData');
            sessionStorage.removeItem('formateurUser');
            
            // Rediriger après un court délai
            setTimeout(() => {
              window.location.href = '/formateur';
            }, 1000);
            return;
          }
        }
      } catch (loginError) {
        console.error('Erreur lors de la connexion:', loginError);
        // Continuer avec la vérification du code si la connexion échoue
      }

      // Si on arrive ici, essayer la vérification du code
      try {
        const response = await API.post('/auth/verify-formateur-code', {
          email,
          code: code.trim()
        });

        console.log('Réponse de vérification du code:', response.data);

        if (response.data.valid) {
          if (password) {
            const loginResponse = await API.post('/auth/login', {
              email,
              password,
              codeFormateur: code.trim()
            });
            if (!loginResponse.data.token) {
              throw new Error('Erreur lors de la connexion après vérification du code');
            }
            const { token, user } = loginResponse.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            updateAuthState(token, user);
          }
          setIsSuccess(true);
          sessionStorage.removeItem('formateurLoginData');
          sessionStorage.removeItem('formateurUser');
          setTimeout(() => {
            window.location.href = '/formateur';
          }, 1000);
        } else {
          throw new Error(response.data.message || 'Code incorrect ou expiré');
        }
      } catch (verifyError) {
        console.error('Erreur lors de la vérification du code:', verifyError);
        throw new Error(verifyError.response?.data?.message || 'Erreur lors de la vérification du code');
      }
      
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Vérifier si c'est une erreur de code incorrect
      const isCodeError = err.message.includes('code') || 
                         err.response?.data?.message?.toLowerCase().includes('code');
      
      if (newAttempts >= maxAttempts) {
        setError('Nombre maximum de tentatives atteint. Retour à la page de connexion.');
        setTimeout(() => {
          handleBackToLogin();
        }, 1200);
      } else if (isCodeError) {
        const remaining = maxAttempts - newAttempts;
        setError(`Votre code est incorrect. Il vous reste ${remaining} tentative${remaining > 1 ? 's' : ''}.`);
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Une erreur est survenue';
        const remaining = maxAttempts - newAttempts;
        setError(`${errorMsg}. Il vous reste ${remaining} tentative${remaining > 1 ? 's' : ''}.`);
      }
      
      console.error('Erreur lors de la vérification du code:', {
        error: err,
        response: err.response?.data,
        attempts: newAttempts
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-xl">
                <FiLock className="text-white text-3xl" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Code Formateur Requis
          </h2>
          <p className="text-gray-600">
            Bonjour <span className="font-semibold text-blue-700">{user?.nom} {user?.prenom}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez entrer le code spécial qui vous a été fourni par l'administrateur
          </p>
        </div>

        {/* Bouton de retour */}
        <div className="text-center mb-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              // Nettoyer les données de session
              sessionStorage.removeItem('formateurLoginData');
              sessionStorage.removeItem('formateurUser');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Utiliser window.location pour forcer un rechargement complet
              window.location.href = '/login';
            }}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            Retour à la connexion
          </button>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start"
          >
            <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Success message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start"
          >
            <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm font-medium">
              ✅ Le code est correcte ! Redirection vers votre tableau de bord...
            </p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FiLock className="text-blue-600" />
              Code Formateur
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                // Formater automatiquement le code en majuscules
                let value = e.target.value.toUpperCase();
                
                // Ajouter automatiquement le préfixe CFP- si nécessaire
                if (value.length > 0 && !value.startsWith('CFP-')) {
                  value = 'CFP-' + value.replace(/^CFP-/, '');
                }
                
                // Limiter la longueur
                if (value.length <= 8) { // CFP-1234 = 8 caractères
                  setCode(value);
                  setError('');
                }
              }}
              placeholder="CFP-1234"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center text-lg font-mono tracking-widest"
              required
              maxLength={8}
              autoFocus
            />
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Format: CFP-XXXX (4 chiffres)
              </p>
              {attempts > 0 && (
                <p className={`text-sm mt-1 ${
                  isMaxAttemptsReached ? 'text-red-600 font-medium' : 'text-gray-600'
                }`}>
                  Tentative {Math.min(attempts, maxAttempts)}/{maxAttempts}
                </p>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || isSuccess || isMaxAttemptsReached}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
              isLoading || isSuccess || code.length < 4 || isMaxAttemptsReached
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </>
            ) : isSuccess ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </>
            ) : (
              <>
                <FiCheckCircle className="text-xl" />
                Vérifier le code
              </>
            )}
          </motion.button>
        </form>

        {/* Message informatif après plusieurs échecs */}
        {attempts >= 3 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              💡 <strong>Conseil :</strong> Si vous ne vous souvenez plus de votre code,
              contactez l'administrateur pour le récupérer.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-500">CFP Charpentier Marine</span>
        </div>
      </motion.div>
    </div>
  );
}
