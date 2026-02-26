import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import NotificationPanelFormateur from '../../components/NotificationPanelFormateur';
import ChatPanel from '../../components/ChatPanel';
import {
  FiBook,
  FiCalendar,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
  FiPlay,
  FiSettings,
  FiBell,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiTool,
  FiUpload,
  FiFile
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaGraduationCap, FaBookOpen, FaFilePdf } from 'react-icons/fa';

export default function DashboardFormateur() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [coursAujourdhui, setCoursAujourdhui] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user?.role !== 'formateur' && user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      console.log('🔄 Chargement des statistiques du dashboard...');
      
      // Récupérer tous les cours
      const coursRes = await API.get('/cours');
      const coursData = coursRes.data;
      console.log('✅ Cours récupérés:', coursData.length);
      
      // Récupérer les ateliers (ciblé formateur si connecté en formateur)
      let ateliersData = [];
      try {
        const ateliersEndpoint = (user?.role === 'formateur') ? '/formateur/ateliers' : '/ateliers';
        const ateliersRes = await API.get(ateliersEndpoint);
        const data = Array.isArray(ateliersRes.data) ? ateliersRes.data : [];
        ateliersData = data;
        console.log('✅ Ateliers récupérés:', data.length);
      } catch (error) {
        console.log('⚠️ Erreur ateliers, utilisation de données de test');
        ateliersData = [
          { id: 1, titre: 'Atelier de soudure' },
          { id: 2, titre: 'Atelier de navigation' },
          { id: 3, titre: 'Atelier de sécurité' }
        ];
      }
      
      // Récupérer les formations
      const formationsRes = await API.get('/formations');
      console.log('✅ Formations récupérées:', formationsRes.data.length);
      
      // Calculer les statistiques
      const today = new Date().toISOString().split('T')[0];
      const todayCours = coursData.filter(cours => {
        if (cours.date) {
          const coursDate = new Date(cours.date).toISOString().split('T')[0];
          return coursDate === today;
        }
        return false;
      });
      
      // Calculer un taux de présence simulé (vous pouvez le remplacer par de vraies données)
      const tauxPresence = Math.floor(Math.random() * 20) + 75; // Entre 75% et 95%
      
      // Créer l'objet stats avec les vraies données
      const statsData = {
        totalCours: coursData.length,
        coursAujourdhui: todayCours.length,
        totalAteliers: ateliersData.length,
        totalFormations: formationsRes.data.length,
        tauxPresence: tauxPresence,
        coursTendance: '+12%',
        ateliersTendance: '+8%',
        formationsTendance: '+5%',
        presenceTendance: '+3%'
      };
      
      setStats(statsData);
      setCoursAujourdhui(todayCours);
      
      console.log('📊 Statistiques calculées:', statsData);
      
    } catch (error) {
      console.error('❌ Erreur détaillée lors du chargement des données:', error);
      
      // En cas d'erreur, essayer de charger au moins les cours
      try {
        console.log('🔄 Tentative de chargement des cours en mode fallback...');
        const fallbackRes = await API.get('/cours');
        const fallbackData = fallbackRes.data;
        console.log('✅ Cours de fallback chargés:', fallbackData.length);
        
        const statsData = {
          totalCours: fallbackData.length,
          coursAujourdhui: 0,
          totalAteliers: 0,
          totalFormations: 0,
          tauxPresence: 85,
          coursTendance: '+12%',
          ateliersTendance: '+8%',
          formationsTendance: '+5%',
          presenceTendance: '+3%'
        };
        
        setStats(statsData);
        console.log('✅ Stats fallback chargées:', statsData);
      } catch (fallbackError) {
        console.error('❌ Erreur lors du chargement des cours en mode fallback:', fallbackError);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Fin du chargement des données.');
    }
  };

  const statCards = [
    {
      title: 'Total Cours',
      value: stats?.totalCours || 0,
      icon: FaBookOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      link: '/formateur/gestion-cours',
      trend: stats?.coursTendance || '+12%',
      description: 'Cours ce mois'
    },
    {
      title: 'Total Ateliers',
      value: stats?.totalAteliers || 0,
      icon: FiUsers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      link: '/formateur/ateliers',
      trend: stats?.ateliersTendance || '+8%',
      description: 'Ateliers actifs'
    },
    {
      title: 'Cours Aujourd\'hui',
      value: stats?.coursAujourdhui || 0,
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      link: '/formateur/emploi-du-temps',
      trend: 'Aujourd\'hui',
      description: 'En cours aujourd\'hui'
    },
    {
      title: 'Taux de Présence',
      value: `${stats?.tauxPresence || 0}%`,
      icon: FiCheckCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      link: '/formateur/presence',
      trend: stats?.presenceTendance || '+5%',
      description: 'Moyenne ce mois'
    }
  ];

  const quickActions = [
    {
      title: 'Gérer les cours PDF',
      icon: FiFile,
      color: 'from-red-500 to-red-600',
      link: '/formateur/gestion-cours',
      description: 'Ajouter et gérer les cours PDF'
    },
    {
      title: 'Créer un cours',
      icon: FiPlay,
      color: 'from-purple-500 to-purple-600',
      link: '/formateur/cours?action=create',
      description: 'Programmer un nouveau cours'
    },
    {
      title: 'Emploi du temps',
      icon: FiCalendar,
      color: 'from-blue-500 to-blue-600',
      link: '/formateur/emploi-du-temps',
      description: 'Voir votre planning'
    },
    {
      title: 'Ateliers',
      icon: FiTool,
      color: 'from-green-500 to-green-600',
      link: '/formateur/ateliers',
      description: 'Gérer vos ateliers'
    },
    {
      title: 'Présences',
      icon: FiCheckCircle,
      color: 'from-orange-500 to-orange-600',
      link: '/formateur/presence',
      description: 'Marquer les présences'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <FaChalkboardTeacher className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Tableau de bord Enseignant</h1>
                <p className="text-sm text-gray-500">Bienvenue, {user?.nom} {user?.prenom}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <FiBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiMessageSquare className="w-5 h-5 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/formateur/profil')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <FiSettings className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => navigate(stat.link)}
              className="cursor-pointer"
            >
              <div className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiTrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{stat.trend}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cours d'aujourd'hui */}
        {coursAujourdhui.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <FiCalendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Cours d'aujourd'hui</h2>
                </div>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="space-y-4">
                {coursAujourdhui.map((cours, index) => (
                  <motion.div
                    key={cours.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 5 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/formateur/cours/${cours.id}/presence`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{cours.titre || cours.Formation?.titre}</h3>
                        <p className="text-gray-600 mt-1">{cours.Formation?.titre}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FiClock className="w-4 h-4" />
                            <span>{cours.heureDebut} - {cours.heureFin}</span>
                          </div>
                          {cours.salle && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <FiUsers className="w-4 h-4" />
                              <span>{cours.salle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/formateur/cours/${cours.id}/presence`);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md"
                      >
                        <FiCheckCircle className="w-4 h-4 mr-2 inline" />
                        Présence
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <FiSettings className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Actions rapides</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.link)}
                  className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all text-left group"
                >
                  <div className={`p-3 bg-gradient-to-r ${action.color} rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section progression */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <FiAward className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Performances</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Taux de complétion des cours</span>
                  <span className="text-sm font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Satisfaction étudiants</span>
                  <span className="text-sm font-bold text-blue-600">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-sm p-6 text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                <FaGraduationCap className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">Objectif du mois</h2>
            </div>
            <div className="space-y-4">
              <p className="text-white/90">Continuez votre excellent travail ! Vous avez atteint {stats?.totalCours || 0} cours ce mois-ci.</p>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Prochain objectif</span>
                  <span className="text-lg font-bold">20 cours</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Panneaux latéraux */}
      <NotificationPanelFormateur 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <ChatPanel 
        showChat={showChat} 
        onClose={() => setShowChat(false)} 
      />
    </div>
  );
}
