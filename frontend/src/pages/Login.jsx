import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { 
  FiMail, 
  FiLock, 
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiShield,
  FiUsers,
  FiBookOpen,
  FiCheckCircle,
  FiArrowLeft
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Rediriger automatiquement si déjà authentifié au chargement de la page
  // UNIQUEMENT si l'utilisateur n'a pas encore tenté de se connecter dans cette session
  useEffect(() => {
    if (isAuthenticated && !hasAttemptedLogin) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (user.role === 'formateur') {
            navigate('/formateur', { replace: true });
          } else if (user.role === 'apprenant') {
            navigate('/dashboard', { replace: true });
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
  }, [isAuthenticated, navigate, hasAttemptedLogin]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setHasAttemptedLogin(true);
    
    console.log('📝 LOGIN FORM - DONNÉES DU FORMULAIRE:');
    console.log('   formData.email:', formData.email);
    console.log('   formData.password:', formData.password ? '***' : 'undefined');
    
    try {
      console.log('🚀 APPEL DE authLogin avec:', formData.email, '***');
      const result = await authLogin(formData.email, formData.password);
      console.log('✅ authLogin result:', result);
      
      // Si un code est requis pour un formateur
      if (result.requiresCode === true) {
        if (result.user) {
          sessionStorage.setItem('formateurUser', JSON.stringify(result.user));
          sessionStorage.setItem('formateurLoginData', JSON.stringify(formData));
        }
        navigate('/formateur/code', { 
          replace: true,
          state: { user: result.user }
        });
        return;
      }
      
      if (result.success) {
        setIsSuccess(true);
        
        // Récupérer les informations utilisateur pour un message personnalisé
        const userStr = localStorage.getItem('user');
        let userName = '';
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userName = user.prenom || user.email.split('@')[0] || '';
          } catch (e) {
            userName = '';
          }
        }
        
        // Afficher une notification de succès personnalisée avec SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie !',
          text: userName ? `Bienvenue ${userName} ! Vous êtes maintenant connecté. Redirection en cours...` : 'Vous êtes maintenant connecté. Redirection en cours...',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          customClass: {
            container: 'swal2-container'
          }
        });
        
        setTimeout(() => {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            console.log('✅ Connexion réussie - Rôle détecté:', user.role);
            if (user.role === 'admin') {
              navigate('/admin', { replace: true });
            } else if (user.role === 'formateur') {
              navigate('/formateur', { replace: true });
            } else if (user.role === 'apprenant') {
              navigate('/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        }, 2000);
      } else {
        // Échec retourné par le serveur sans exception
        setErrorMessage(result.error || result.message || 'Erreur lors de la connexion');
        
        // Afficher une notification d'erreur détaillée avec SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p style="margin-bottom: 10px;">${result.error || result.message || 'Erreur lors de la connexion'}</p>
              <p style="color: #6b7280; font-size: 12px;">
                <strong>Suggestions :</strong><br/>
                • Vérifiez que votre email est correct<br/>
                • Assurez-vous que le mot de passe est exact<br/>
                • Vérifiez que votre compte est validé<br/>
                • Essayez de vous reconnecter avec Google
              </p>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          customClass: {
            container: 'swal2-container'
          }
        });
        
        // Si redirection vers page d'attente est nécessaire
        if (result.redirectTo) {
          // Message spécial pour la redirection
          setTimeout(() => {
            navigate(result.redirectTo);
          }, 3000); // Plus de temps pour lire le message
        }
        
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const status = error?.response?.status;
      let errorMessage = 'Erreur lors de la connexion';
      let suggestions = '';
      
      if (status === 401) {
        errorMessage = 'Ce mot de passe est incorrect';
        suggestions = '• Vérifiez la majuscule/minuscule<br/>• Assurez-vous qu\'il n\'y a pas d\'espaces<br/>• Cliquez sur "Mot de passe oublié" si besoin';
      } else if (status === 404) {
        errorMessage = 'Cet email n\'existe pas dans notre système';
        suggestions = '• Vérifiez l\'orthographe de l\'email<br/>• Inscrivez-vous si vous n\'avez pas de compte<br/>• Essayez avec une autre adresse email';
      } else {
        errorMessage = error?.response?.data?.message || 'Erreur lors de la connexion';
        suggestions = '• Vérifiez votre connexion internet<br/>• Réessayez dans quelques instants<br/>• Contactez le support si le problème persiste';
      }
      
      setErrorMessage(errorMessage);
      
      // Afficher une notification d'erreur détaillée avec SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p style="margin-bottom: 10px;">${errorMessage}</p>
            <p style="color: #6b7280; font-size: 12px;">
              <strong>Suggestions :</strong><br/>
              ${suggestions}
            </p>
          </div>
        `,
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        customClass: {
          container: 'swal2-container'
        }
      });
      
      setIsSuccess(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="md:flex">
          {/* Côté gauche avec l'image */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 p-12 text-white">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-4">Bienvenue sur notre plateforme</h1>
                <p className="text-blue-100">
                  Connectez-vous pour accéder à votre espace personnel et continuer votre apprentissage.
                </p>
              </div>
              <div className="mt-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiShield className="text-white" />
                  </div>
                  <p>Connexion sécurisée</p>
                </div>
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiUsers className="text-white" />
                  </div>
                  <p>Accès multi-rôles</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full mr-4">
                    <FiBookOpen className="text-white" />
                  </div>
                  <p>Formation continue</p>
                </div>
              </div>
              <div className="mt-12 text-center">
                <p>Pas encore de compte ?</p>
                <button
                  type="button"
                  onClick={() => navigate('/inscription')}
                  className="mt-2 px-6 py-2 border-2 border-white text-white rounded-full hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  S'inscrire
                </button>
              </div>
            </div>
          </div>

          {/* Côté droit avec le formulaire */}
          <div className="p-8 md:p-12 md:w-1/2">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
                title="Retour à l'accueil"
              >
                <FiArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Se connecter</h2>
              <div className="w-6"></div> {/* Pour l'alignement */}
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md" role="alert">
                <p className="font-medium">Erreur</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md flex items-start" role="alert">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Succès !</p>
                  <p className="text-sm">Connexion réussie ! Redirection...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSuccess}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSuccess ? (
                    <>
                      <FiCheckCircle className="mr-2" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      <FiLogIn className="mr-2" />
                      Se connecter
                    </>
                  )}
                </button>
              </div>

              {/* Lien d'inscription */}
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/inscription')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Créer un compte
                  </button>
                </p>
              </div>
            </form>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OU</span>
              </div>
            </div>

            {/* Connexion avec Google */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google?role=apprenant`}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
              >
                <FcGoogle className="mr-2" />
                Se connecter avec Google
              </button>
              <button
                onClick={() => { setShowRolePicker(true); }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-md shadow-sm py-2 px-4 text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <FcGoogle className="mr-2" />
                S'inscrire avec Google
              </button>
            </div>

            {/* Informations des rôles */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FiShield className="mr-2" />
                Accès automatique selon votre rôle
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <FiUsers className="text-gray-500" />
                  </div>
                  <span><strong>Admin</strong> → Dashboard administrateur</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <FiBookOpen className="text-gray-500" />
                  </div>
                  <span><strong>Formateur</strong> → Espace formateur</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <FiUsers className="text-gray-500" />
                  </div>
                  <span><strong>Apprenant</strong> → Espace étudiant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showRolePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Choisir votre type d'inscription</h2>
                <p className="text-sm text-gray-500">Sélectionnez votre rôle pour continuer avec Google</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => { window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google?role=apprenant`; }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <FiUsers className="text-gray-600" />
                  <span>Apprenant</span>
                </button>
                <button
                  onClick={() => { window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google?role=formateur`; }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <FiBookOpen className="text-gray-600" />
                  <span>Formateur</span>
                </button>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowRolePicker(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
