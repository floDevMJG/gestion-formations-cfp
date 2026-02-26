import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function EnAttenteValidation() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Récupérer les infos utilisateur depuis localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Erreur parsing user:', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      // Simuler une vérification du statut (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici vous pourriez appeler une API pour vérifier le statut
      // const response = await API.get('/auth/check-status');
      
      setIsChecking(false);
      // Si le statut a changé, rediriger vers login
      // if (response.data.statut === 'actif') {
      //   navigate('/login');
      // }
    } catch (error) {
      setIsChecking(false);
      console.error('Erreur vérification statut:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusMessage = () => {
    if (!user) return '';
    
    switch (user.statut) {
      case 'en_attente':
        return {
          color: 'yellow',
          icon: FiClock,
          title: 'En attente de validation',
          message: 'Votre compte est en cours de validation par notre équipe administrative.',
          subMessage: 'Vous recevrez un email dès que votre compte sera validé.'
        };
      case 'rejete':
      case 'refuse':
        return {
          color: 'red',
          icon: FiAlertCircle,
          title: 'Compte rejeté',
          message: 'Votre demande d\'inscription a été rejetée.',
          subMessage: 'Veuillez contacter l\'administrateur pour plus d\'informations.'
        };
      default:
        return {
          color: 'blue',
          icon: FiMail,
          title: 'En attente de validation',
          message: 'Votre compte est en attente de validation.',
          subMessage: 'Veuillez vérifier votre email régulièrement.'
        };
    }
  };

  const statusInfo = getStatusMessage();
  const Icon = statusInfo.icon;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${statusInfo.color}-100 mb-4`}>
            <Icon className={`text-2xl text-${statusInfo.color}-600`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {statusInfo.title}
          </h2>
          <p className="text-gray-600">
            Bonjour <span className="font-semibold text-blue-700">{user.prenom} {user.nom}</span>
          </p>
        </div>

        {/* Message principal */}
        <div className={`mb-6 p-4 bg-${statusInfo.color}-50 border-l-4 border-${statusInfo.color}-500 rounded-lg`}>
          <p className={`text-${statusInfo.color}-800 font-medium mb-2`}>
            {statusInfo.message}
          </p>
          <p className={`text-${statusInfo.color}-700 text-sm`}>
            {statusInfo.subMessage}
          </p>
        </div>

        {/* Informations utilisateur */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Vos informations :</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Rôle :</strong> Apprenant</p>
            <p><strong>Statut :</strong> <span className={`text-${statusInfo.color}-600 font-medium`}>{user.statut}</span></p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckStatus}
            disabled={isChecking}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isChecking 
                ? 'bg-gray-400 cursor-not-allowed' 
                : `bg-${statusInfo.color}-600 hover:bg-${statusInfo.color}-700 text-white`
            }`}
          >
            {isChecking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Vérification...
              </>
            ) : (
              <>
                <FiRefreshCw />
                Vérifier le statut
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FiLogOut />
            Se déconnecter
          </motion.button>
        </div>

        {/* Message d'aide */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Besoin d'aide ? Contactez l'administrateur à 
            <a href="mailto:admin@cfp-charpentier.com" className="text-blue-600 hover:underline ml-1">
              admin@cfp-charpentier.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <span className="text-xs text-gray-500">CFP Charpentier Marine</span>
        </div>
      </motion.div>
    </div>
  );
}
