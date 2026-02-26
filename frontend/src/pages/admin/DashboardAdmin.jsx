import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/StatCard';
import NotificationPanel from '../../components/NotificationPanel';
import ChatPanel from '../../components/ChatPanel';
import {
  FiUsers,
  FiUser,
  FiBook,
  FiFileText,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiCheckCircle,
  FiSettings,
  FiAnchor,
  FiTrendingUp,
  FiChevronRight,
  FiBell,
  FiMessageSquare,
  FiTool
} from 'react-icons/fi';
import { FaShip, FaTools, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [recentAteliers, setRecentAteliers] = useState([]);
  const [ateliersLoading, setAteliersLoading] = useState(true);

  useEffect(() => {
    console.log('Changement détecté dans l\'état stats:', stats);
    if (stats) {
      console.log('Structure de l\'objet stats:', {
        keys: Object.keys(stats),
        values: Object.entries(stats).map(([key, value]) => `${key}: ${value} (${typeof value})`)
      });
    }
  }, [stats]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setStats(null);
          return;
        }
        const response = await API.get('/admin/stats');
        console.log('Réponse de l\'API /admin/stats:', response.data);
        setStats(response.data);
      } catch (error) {
        // Silence si non autorisé/non connecté pour éviter bruit console
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  useEffect(() => {
    // Vérifier le rôle depuis localStorage aussi au cas où user n'est pas encore chargé
    const userStr = localStorage.getItem('user');
    let userRole = user?.role;
    
    if (!userRole && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userRole = userObj.role;
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
    
    if (userRole !== 'admin') {
      console.log('Redirection: rôle non admin détecté:', userRole); // Debug
      navigate('/dashboard');
      return;
    }
    
    fetchRecentAteliers();
  }, [user, navigate]);

  const fetchRecentAteliers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setRecentAteliers([]);
        return;
      }
      const response = await API.get('/admin/ateliers');
      setRecentAteliers(response.data.slice(0, 5)); // Prendre les 5 plus récents
    } catch (error) {
      // Silence si non autorisé/non connecté
    } finally {
      setAteliersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      console.log('Réponse de l\'API /admin/stats:', response.data);
      // S'assurer que toutes les propriétés nécessaires sont présentes
      const defaultStats = {
        totalUsers: 0,
        totalApprenants: 0,
        totalFormateurs: 0,
        totalFormations: 0,
        totalAteliers: 0,
        totalInscriptions: 0,
        inscriptionsEnAttente: 0,
        usersEnAttente: 0,
        formateursEnAttente: 0,
        usersByRole: {}
      };
      
      // Fusionner avec les valeurs par défaut pour éviter les erreurs
      setStats({
        ...defaultStats,
        ...response.data,
        usersByRole: response.data.usersByRole || {}
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  console.log('Rendu du composant - État actuel de stats:', stats);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement en cours</h2>
          <p className="text-gray-600">Veuillez patienter pendant le chargement des données...</p>
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <FiAnchor className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl" />
          </div>
          <p className="mt-4 text-blue-900 font-semibold">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  console.log('Création des cartes de statistiques avec stats:', stats);
  
  // Composant de carte de statistique
  const StatCard = ({ title, value, icon, gradient, bgGradient, link, color, urgent }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${urgent ? 'border-red-500' : 'border-transparent'}`}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${bgGradient} bg-opacity-50`}>
            <div className={`text-2xl ${color}`}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="mt-4">
          <a 
            href={link} 
            className={`text-sm font-medium ${color} hover:underline flex items-center`}
          >
            Voir plus
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: <FiUsers />,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'bg-blue-100',
      link: '/admin/users',
      color: 'text-blue-600'
    },
    {
      title: 'Étudiants',
      value: stats?.totalApprenants?.toLocaleString() || '0',
      icon: <FaUserGraduate />,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'bg-green-100',
      link: '/admin/users?role=apprenant',
      color: 'text-green-600'
    },
    {
      title: 'Enseignants',
      value: stats?.totalFormateurs?.toLocaleString() || '0',
      icon: <FaChalkboardTeacher />,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'bg-purple-100',
      link: '/admin/users?role=formateur',
      color: 'text-purple-600'
    },
    {
      title: 'Formations',
      value: stats?.totalFormations?.toLocaleString() || '0',
      icon: <FaShip />,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'bg-orange-100',
      link: '/admin/formations',
      color: 'text-orange-600'
    },
    {
      title: 'Ateliers',
      value: stats?.totalAteliers?.toLocaleString() || '0',
      icon: <FiTool />,
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'bg-teal-100',
      link: '/admin/ateliers',
      color: 'text-teal-600'
    },
    {
      title: 'Inscriptions',
      value: stats?.totalInscriptions?.toLocaleString() || '0',
      icon: <FiFileText />,
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'bg-indigo-100',
      link: '/admin/inscriptions',
      color: 'text-indigo-600'
    },
    {
      title: 'Inscriptions en attente',
      value: stats?.inscriptionsEnAttente?.toLocaleString() || '0',
      icon: <FiClock />,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'bg-yellow-100',
      link: '/admin/inscriptions?statut=en_attente',
      color: 'text-yellow-600',
      urgent: true
    },
    {
      title: 'Étudiants en attente',
      value: stats?.usersEnAttente?.toLocaleString() || '0',
      icon: <FiAlertCircle />,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'bg-red-100',
      link: '/admin/users?role=apprenant&statut=en_attente',
      color: 'text-red-600',
      urgent: true
    },
    {
      title: 'Formateurs en attente',
      value: stats?.formateursEnAttente?.toLocaleString() || '0',
      icon: <FaChalkboardTeacher />,
      gradient: 'from-fuchsia-500 to-fuchsia-600',
      bgGradient: 'bg-fuchsia-100',
      link: '/admin/users?role=formateur&statut=en_attente',
      color: 'text-fuchsia-600',
      urgent: true
    }
  ];

  const quickActions = [
    {
      title: 'Ajouter Formation',
      icon: <FiPlus className="text-2xl" />,
      gradient: 'from-blue-600 to-blue-800',
      onClick: () => navigate('/create-formation'),
      description: 'Créer une nouvelle formation'
    },
    {
      title: 'Ajouter Utilisateur',
      icon: <FiUser className="text-2xl" />,
      gradient: 'from-green-600 to-green-800',
      onClick: () => navigate('/admin/users?action=create'),
      description: 'Créer un nouvel utilisateur'
    },
    {
      title: 'Valider Inscriptions',
      icon: <FiCheckCircle className="text-2xl" />,
      gradient: 'from-yellow-500 to-yellow-700',
      onClick: () => navigate('/admin/inscriptions?statut=en_attente'),
      description: 'Valider les inscriptions en attente',
      badge: stats?.inscriptionsEnAttente || 0
    },
    {
      title: 'Valider Étudiants',
      icon: <FiUsers className="text-2xl" />,
      gradient: 'from-orange-600 to-orange-800',
      onClick: () => navigate('/admin/users?role=apprenant'),
      description: 'Valider les étudiants en attente',
      badge: stats?.usersEnAttente || 0
    },
    {
      title: 'Gérer Formations',
      icon: <FiBook className="text-2xl" />,
      gradient: 'from-purple-600 to-purple-800',
      onClick: () => navigate('/admin/formations'),
      description: 'Gérer toutes les formations'
    },
    {
      title: 'Gérer Ateliers',
      icon: <FiTool className="text-2xl" />,
      gradient: 'from-teal-600 to-teal-800',
      onClick: () => navigate('/admin/ateliers'),
      description: 'Gérer tous les ateliers'
    },
    {
      title: 'Paramètres',
      icon: <FiSettings className="text-2xl" />,
      gradient: 'from-gray-600 to-gray-800',
      onClick: () => navigate('/admin/settings'),
      description: 'Paramètres du système'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header Section */}
        {stats && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-3 rounded-xl">
                    <FiAnchor className="text-white text-2xl" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Nouveaux étudiants</p>
                  <p className="text-xs opacity-90">{stats.usersEnAttente} en attente de validation</p>
                </div>
                <FiChevronRight className="opacity-80" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        {!stats ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Les données de statistiques ne sont pas encore disponibles. Vérifiez la connexion au serveur.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 lg:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg">
              <FiSettings className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Actions rapides</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={`relative bg-gradient-to-r ${action.gradient} text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-left group overflow-hidden`}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      {action.icon}
                    </div>
                    {action.badge && action.badge > 0 && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full animate-pulse">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
                
                {/* Hover effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Ateliers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg">
                  <FiTool className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Ateliers récents</h2>
              </div>
              <button 
                onClick={() => navigate('/admin/ateliers')}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium"
              >
                Voir tout
                <FiTrendingUp className="text-lg" />
              </button>
            </div>
          </div>
          
          {ateliersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : recentAteliers.length === 0 ? (
            <div className="text-center py-8">
              <FiTool className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun atelier trouvé</p>
              <button
                onClick={() => navigate('/admin/ateliers')}
                className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Créer un atelier
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Titre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Heure</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Salle</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAteliers.map((atelier) => (
                    <tr key={atelier.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{atelier.titre}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{atelier.description}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(atelier.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {atelier.heureDebut} - {atelier.heureFin}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {atelier.salle}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          atelier.statut === 'actif' 
                            ? 'bg-green-100 text-green-800' 
                            : atelier.statut === 'annulé'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {atelier.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/admin/ateliers`)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />

        {/* Chat Panel */}
        <ChatPanel
          showChat={showChat}
          onClose={() => setShowChat(false)}
        />
      </div>
    </div>
  );
}
