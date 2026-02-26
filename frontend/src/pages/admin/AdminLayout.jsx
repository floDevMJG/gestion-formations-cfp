import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import { FiAnchor, FiLogOut, FiBell, FiMessageSquare, FiBriefcase, FiCalendar, FiClock } from 'react-icons/fi';
import NotificationPanelAdmin from '../../components/NotificationPanelAdmin';

// Composant de notification pour les étudiants et inscriptions en attente
const NotificationBadge = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingInscriptions, setPendingInscriptions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Supprimer cette logique ici — le compteur admin est géré dans AdminLayout

  const fetchPendingCount = async () => {
    try {
      // Ne rien faire si pas de jeton (évite erreurs 401 en console)
      const token = localStorage.getItem('token');
      if (!token) {
        setPendingUsers(0);
        setPendingInscriptions(0);
        return;
      }
      const response = await API.get('/admin/stats');
      setPendingUsers(response.data?.usersEnAttente || 0);
      setPendingInscriptions(response.data?.inscriptionsEnAttente || 0);
    } catch (error) {
      // Silencieux en cas d'utilisateur non admin/non connecté
      setPendingUsers(0);
      setPendingInscriptions(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading || (pendingUsers === 0 && pendingInscriptions === 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {pendingUsers > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/admin/users?role=apprenant&statut=en_attente')}
          className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title={`${pendingUsers} étudiant(s) en attente de validation`}
        >
          <FiBell className="w-6 h-6" />
          <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
            {pendingUsers}
          </span>
        </motion.button>
      )}
      {pendingInscriptions > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/admin/inscriptions?statut=en_attente')}
          className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title={`${pendingInscriptions} inscription(s) en attente`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
            {pendingInscriptions}
          </span>
        </motion.button>
      )}
    </div>
  );
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
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

  // Charger et rafraîchir le compteur de notifications admin non lues
  useEffect(() => {
    const fetchAdminUnread = async () => {
      try {
        const res = await API.get('/notifications/admin');
        const list = Array.isArray(res.data) ? res.data : [];
        setAdminUnreadCount(list.filter(n => !n.isRead).length);
      } catch (e) {
        setAdminUnreadCount(0);
      }
    };
    fetchAdminUnread();
    const interval = setInterval(fetchAdminUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Charger et rafraîchir le compteur de messages non lus (envoyés au compte admin)
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await API.get('/messages/unread');
        const count = typeof res.data?.count === 'number' ? res.data.count : 0;
        setUnreadMessagesCount(count);
      } catch (e) {
        setUnreadMessagesCount(0);
      }
    };
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar */}
      <div className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white w-64 flex-shrink-0 shadow-2xl relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative z-10 p-4 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/cfpmarine.jpeg" 
                alt="CFP Charpentier Marine Logo" 
                className="h-12 w-12 rounded-full border-2 border-yellow-400 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <FiAnchor className="text-blue-900 text-xs" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Espace Administration</h2>
              <p className="text-xs text-blue-200">CFP Charpentier Marine</p>
            </div>
          </div>
        </div>
        <nav className="mt-6 relative z-10">
          <div className="px-4 py-2 text-blue-200 uppercase text-xs font-semibold flex items-center gap-2">
            <div className="h-px flex-1 bg-blue-700/50"></div>
            <span>Menu Principal</span>
            <div className="h-px flex-1 bg-blue-700/50"></div>
          </div>
          <Link 
            to="/admin" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Tableau de bord
          </Link>
          <Link 
            to="/admin/formations" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Formations
          </Link>
          <Link 
            to="/admin/ateliers" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <FiBriefcase className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Ateliers
          </Link>
          <Link 
            to="/admin/users" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Utilisateurs
          </Link>
          <Link 
            to="/admin/inscriptions" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Inscriptions
          </Link>
          <Link 
            to="/admin/annonces-formateurs" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <FiCalendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Annonces Formateurs
          </Link>
          <Link 
            to="/admin/annonces-apprenants" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <FiClock className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Annonces Apprenants
          </Link>
          <Link 
            to="/admin/messagerie" 
            className="flex items-center px-6 py-3 text-white hover:bg-blue-700/50 hover:border-l-4 hover:border-yellow-400 transition-all duration-200 group"
          >
            <FiMessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Messagerie
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="text-gray-700">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Tableau de bord
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBadge />
              
              {/* Bouton Messages (non lus) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/messagerie')}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300"
                title="Messagerie (messages non lus)"
              >
                <FiMessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {unreadMessagesCount}
                  </span>
                )}
              </motion.button>

              {/* Bouton Notifications Admin */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300"
                title="Notifications des demandes de congé/permission"
              >
                <FiBell className="w-5 h-5" />
                {adminUnreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {adminUnreadCount}
                  </span>
                )}
              </motion.button>
              
              <div className="relative" ref={menuRef}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 focus:outline-none hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.nom?.[0]}{user?.prenom?.[0]}
                  </div>
                  <span className="text-gray-700 font-medium hidden md:block">{user?.nom} {user?.prenom}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.nom} {user?.prenom}</p>
                      <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-blue-50/50 to-white">
          <Outlet />
        </main>
      </div>

      {/* Panneau de notifications admin */}
      <NotificationPanelAdmin 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
        onUnreadChange={(delta) => setAdminUnreadCount((c) => Math.max(0, c + delta))}
      />
    </div>
  );
};

export default AdminLayout;
