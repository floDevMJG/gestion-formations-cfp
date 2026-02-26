import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiUser, 
  FiAnchor,
  FiLogIn,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaShip, FaTools, FaWater } from 'react-icons/fa';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  // Rediriger automatiquement si déjà authentifié selon le rôle
  useEffect(() => {
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Redirection automatique selon le rôle
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (user.role === 'formateur') {
            navigate('/formateur', { replace: true });
          } else if (user.role === 'apprenant') {
            navigate('/dashboard-apprenant', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } catch (e) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      // Connexion automatique - le système détectera le rôle
      const result = await authLogin(formData.email, formData.password);
      
      // Si un code est requis pour un formateur
      if (result.requiresCode === true) {
        setIsLoading(false);
        if (result.user) {
          sessionStorage.setItem('formateurUser', JSON.stringify(result.user));
        }
        navigate('/formateur/code', { 
          replace: true,
          state: { user: result.user }
        });
        return;
      }
      
      if (result.success) {
        // La redirection se fera automatiquement via le useEffect
        // qui surveille isAuthenticated
        setTimeout(() => {
          // Forcer la vérification du rôle pour le debug
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            console.log('✅ Connexion réussie - Rôle détecté:', user.role);
            console.log('🔄 Redirection automatique vers:', 
              user.role === 'admin' ? '/admin' : 
              user.role === 'formateur' ? '/formateur' : 
              '/dashboard-apprenant'
            );
          }
        }, 100);
      } else {
        setErrorMessage(result.message || 'Erreur lors de la connexion');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setErrorMessage('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
          if (errorMsg.includes('en attente de validation')) {
            setTimeout(() => {
              navigate('/en-attente', { replace: true });
            }, 2000);
          }
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage('Les mots de passe ne correspondent pas');
          setIsLoading(false);
          return;
        }
        
        // Appel réel à l'API d'inscription
        const res = await API.post('/auth/register', {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          role: selectedRole || 'apprenant' // Utiliser le rôle sélectionné ou 'apprenant' par défaut
        });
        
        // Inscription réussie
        const roleInscrit = selectedRole || 'apprenant';
        if (roleInscrit === 'apprenant') {
          setSuccessMessage('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur. Vous recevrez un email une fois votre compte validé.');
        } else if (roleInscrit === 'formateur') {
          setSuccessMessage('Inscription réussie ! Votre compte est en attente de validation par l\'administrateur. Vous recevrez un code spécial par email une fois votre compte validé.');
        } else {
          setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        }
        setIsLogin(true);
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err) {
      let errorMsg = isLogin ? 'Erreur de connexion' : "Erreur lors de l'inscription";
      
      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        errorMsg = err.response.data?.message || err.response.data?.error || errorMsg;
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMsg = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 5000.';
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMsg = err.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      console.error('Erreur détaillée:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogins = [
    { name: 'Google', icon: 'G', color: 'red-500' },
    { name: 'Facebook', icon: 'f', color: 'blue-600' },
    { name: 'GitHub', icon: 'G', color: 'gray-700' },
    { name: 'LinkedIn', icon: 'in', color: 'blue-500' }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-white">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-12 text-white w-1/2 relative overflow-hidden">
        {/* Background image with overlay - Marine theme */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(30, 58, 138, 0.85), rgba(29, 78, 216, 0.75)), url(https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-blue-800/90"></div>
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="absolute rounded-full bg-yellow-400/20 w-64 h-64 -top-32 -left-32 animate-pulse"></div>
          <div className="absolute rounded-full bg-blue-400/20 w-96 h-96 -bottom-48 -right-48"></div>
        </motion.div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1
        }}></div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative">
              <img 
                src="/cfpmarine.jpeg" 
                alt="CFP Charpentier Marine Logo" 
                className="h-16 w-16 rounded-full border-2 border-yellow-400 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5">
                <FiAnchor className="text-blue-900 text-xs" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">CFP Charpentier Marine</h2>
              <p className="text-blue-200 text-sm">Formation Professionnelle Maritime</p>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isLogin ? 'Bienvenue' : 'Créer un compte'}
          </motion.h1>
          <motion.p 
            className="text-blue-100 text-lg leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isLogin 
              ? 'Connectez-vous à votre espace pour accéder à toutes les fonctionnalités' 
              : 'Rejoignez le CFP Charpentier Marine et commencez votre parcours de formation maritime'}
          </motion.p>
          
          {/* Marine icons floating */}
          <div className="mt-8 flex gap-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-lg"
            >
              <FaShip className="text-2xl text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-lg"
            >
              <FaTools className="text-2xl text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-lg"
            >
              <FaWater className="text-2xl text-yellow-400" />
            </motion.div>
          </div>
        </div>

        <div className="relative z-10">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage(''); // Réinitialiser le message d'erreur
            }}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <>
                <FiUser className="text-xl" />
                Créer un compte
              </>
            ) : (
              <>
                <FiLogIn className="text-xl" />
                Se connecter
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        
        <motion.div 
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <img 
                src="/cfpmarine.jpeg" 
                alt="CFP Charpentier Marine Logo" 
                className="h-14 w-14 rounded-full border-2 border-blue-600 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <FiAnchor className="text-blue-900 text-xs" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-900">CFP Charpentier Marine</h2>
              <p className="text-xs text-blue-600">Formation Professionnelle Maritime</p>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <motion.h2 
              className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </motion.h2>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isLogin ? 'Connectez-vous à votre compte' : 'Remplissez vos informations pour créer un compte'}
            </motion.p>
            
            {/* Sélection du type de compte */}
            {isLogin && (
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedRole('apprenant')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'apprenant'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Étudiant
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('formateur')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'formateur'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Enseignant
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'admin'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            )}
            
            {!isLogin && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                <select
                  value={selectedRole || 'apprenant'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="apprenant">Étudiant</option>
                  <option value="formateur">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
          {/* Affichage du message d'erreur */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm"
            >
              <div className="flex items-start">
                <FiAlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Affichage du message de succès */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm"
            >
              <div className="flex items-start">
                <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="nom">
                  <FiUser className="text-blue-600" />
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Dupont"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="prenom">
                  <FiUser className="text-blue-600" />
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Jean"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="email">
              <FiMail className="text-blue-600" />
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="jean.dupont@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-semibold flex items-center gap-2" htmlFor="password">
                <FiLock className="text-blue-600" />
                Mot de passe
              </label>
              {isLogin && (
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  Mot de passe oublié ?
                </Link>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
              required
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <FiCheckCircle className="text-green-500" />
                Au moins 8 caractères requis
              </p>
            )}
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2" htmlFor="confirmPassword">
                <FiLock className="text-blue-600" />
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading || (isLogin && !selectedRole)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 px-4 rounded-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
              selectedRole === 'admin' ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500' :
              selectedRole === 'formateur' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500' :
              'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:ring-blue-500'
            } text-white`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Connexion...' : 'Inscription...'}
              </>
            ) : (
              <>
                <FiLogIn className="text-xl" />
                {isLogin ? 'Se connecter' : 'S\'inscrire'}
              </>
            )}
          </motion.button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {socialLogins.map((social) => (
              <motion.button
                key={social.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none`}
              >
                <span className={`text-${social.color} font-bold`}>{social.icon}</span>
              </motion.button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage(''); // Réinitialiser le message d'erreur
                setSelectedRole(null); // Réinitialiser la sélection du rôle
              }}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
          
          {/* Footer with logo */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-center gap-2">
            <FiAnchor className="text-blue-600" />
            <span className="text-xs text-gray-500">CFP Charpentier Marine - Formation Professionnelle Maritime</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}