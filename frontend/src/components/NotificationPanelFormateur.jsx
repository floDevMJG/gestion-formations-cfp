import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiUserPlus, FiCheckCircle, FiAlertTriangle, FiCalendar, FiBook } from 'react-icons/fi';
import API from '../services/api';

const NotificationPanelFormateur = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await API.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      // En cas d'erreur, afficher des notifications de démonstration
      setNotifications([
        {
          id: 1,
          type: 'new_student',
          message: 'Nouvel étudiant inscrit à votre cours',
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: 2,
          type: 'course_reminder',
          message: 'Rappel : Cours prévu dans 1 heure',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: false
        },
        {
          id: 3,
          type: 'presence_alert',
          message: 'Plusieurs absences détectées cette semaine',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          isRead: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_student':
        return <FiUserPlus className="text-green-600" />;
      case 'course_reminder':
        return <FiCalendar className="text-blue-600" />;
      case 'presence_alert':
        return <FiAlertTriangle className="text-orange-600" />;
      case 'course_cancelled':
        return <FiX className="text-red-600" />;
      case 'new_course':
        return <FiBook className="text-purple-600" />;
      default:
        return <FiBell className="text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'new_student':
        return 'bg-green-50 border-green-200';
      case 'course_reminder':
        return 'bg-blue-50 border-blue-200';
      case 'presence_alert':
        return 'bg-orange-50 border-orange-200';
      case 'course_cancelled':
        return 'bg-red-50 border-red-200';
      case 'new_course':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FiBell className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Notifications</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-white/90 mt-2 text-sm">
                {notifications.filter(n => !n.isRead).length} non lue(s)
              </p>
            </div>

            <div className="h-full overflow-y-auto pb-20">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full"
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FiBell className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-center">Aucune notification</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        notification.isRead 
                          ? 'bg-white border-gray-200' 
                          : getBgColor(notification.type)
                      }`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <FiX className="w-4 h-4 text-gray-400" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanelFormateur;
