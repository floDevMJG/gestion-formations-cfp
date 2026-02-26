import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import { FiAnchor, FiLogOut, FiBell, FiMessageSquare, FiBook, FiCalendar, FiUsers, FiTool, FiSettings, FiClock } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import NotificationPanelFormateur from '../../components/NotificationPanelFormateur';
import ChatPanel from '../../components/ChatPanel';

const FormateurLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Charger les notifications et messages non lus
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      // Récupérer les messages non lus
      const messagesResponse = await API.get('/messages/unread');
      setUnreadMessages(messagesResponse.data.count || 0);

      // Récupérer les notifications (cours aujourd'hui, etc.)
      const notificationsResponse = await API.get('/notifications');
      setPendingNotifications(notificationsResponse.data?.length || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const menuItems = [
    {
      to: '/formateur',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Tableau de bord'
    },
    {
      to: '/formateur/emploi-du-temps',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Emploi du temps'
    },
    {
      to: '/formateur/gestion-cours',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'Mes Cours'
    },
    {
      to: '/formateur/ateliers',
      icon: <FiTool className="w-5 h-5" />,
      label: 'Ateliers'
    },
    {
      to: '/formateur/presence',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      label: 'Présences'
    },
    {
      to: '/formateur/annonces',
      icon: <FiBell className="w-5 h-5" />,
      label: 'Annonces'
    },
    {
      to: '/formateur/profil',
      icon: <FiSettings className="w-5 h-5" />,
      label: 'Mon Profil'
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Sidebar */}
      <div className="bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white w-64 flex-shrink-0 shadow-2xl relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative z-10 p-4 border-b border-purple-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/cfpmarine.jpeg" 
                alt="CFP Charpentier Marine Logo" 
                className="h-12 w-12 rounded-full border-2 border-yellow-400 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <FaChalkboardTeacher className="text-purple-900 text-xs" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Espace Enseignant</h2>
              <p className="text-xs text-purple-200">CFP Charpentier Marine</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 relative z-10">
          <div className="px-4 py-2 text-purple-200 uppercase text-xs font-semibold flex items-center gap-2">
            <div className="h-px flex-1 bg-purple-700/50"></div>
            <span>Menu Principal</span>
            <div className="h-px flex-1 bg-purple-700/50"></div>
          </div>
          
          {menuItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link 
                to={item.to} 
                className="flex items-center px-6 py-3 text-white hover:bg-purple-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
              >
                <span className="mr-3 group-hover:scale-110 transition-transform inline-block">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white shadow-sm border-b border-gray-200 z-10"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/cfpmarine.jpeg" 
                  alt="CFP Charpentier Marine" 
                  className="h-8 w-8 rounded-lg border border-purple-200"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-800">CFP Charpentier Marine</h1>
                  <p className="text-xs text-gray-500">Centre de Formation Professionnelle</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {pendingNotifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg"
                  >
                    {pendingNotifications}
                  </motion.span>
                )}
              </motion.button>

              {/* Messages */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
                title="Messages"
              >
                <FiMessageSquare className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg"
                  >
                    {unreadMessages}
                  </motion.span>
                )}
              </motion.button>

              {/* Menu utilisateur avec déconnexion */}
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                  title="Menu utilisateur"
                >
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-purple-900 font-bold text-xs">
                      {user?.nom?.[0]}{user?.prenom?.[0]}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.nom} {user?.prenom}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-purple-200 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-purple-50">
                        <p className="text-sm font-medium text-gray-900">{user?.nom} {user?.prenom}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <p className="text-xs text-purple-600 font-medium">Formateur</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/formateur/profil');
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <FiSettings className="w-4 h-4 mr-3" />
                        Mon Profil
                      </button>
                      <button
                        onClick={() => {
                          navigate('/formateur/mes-conges');
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <FiCalendar className="w-4 h-4 mr-3" />
                        Mes Congés
                      </button>
                      <button
                        onClick={() => {
                          navigate('/formateur/mes-permissions');
                          setShowMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                      >
                        <FiClock className="w-4 h-4 mr-3" />
                        Mes Permissions
                      </button>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4 mr-3" />
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
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
};

export default FormateurLayout;
