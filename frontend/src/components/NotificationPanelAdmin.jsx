import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCalendar, FiClock, FiCheck, FiXCircle, FiEye, FiDownload, FiUser, FiMail, FiAlertCircle } from 'react-icons/fi';
import API from '../services/api';

const NotificationPanelAdmin = ({ isOpen, onClose, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Charger les notifications admin (on garde les non lues en priorité)
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await API.get('/notifications/admin');
      const data = Array.isArray(response.data) ? response.data : [];
      const unreadFirst = [...data.filter(n => !n.isRead), ...data.filter(n => n.isRead)];
      setNotifications(unreadFirst);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Marquer une notification comme lue
  const marquerCommeLue = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (typeof onUnreadChange === 'function') {
        onUnreadChange(-1);
      }
    } catch (error) {
      console.error('Erreur marquer notification lue:', error);
    }
  };

  // Approuver une demande
  const approuverDemande = async (demande) => {
    try {
      const endpoint = demande.entite_type === 'conge' 
        ? `/conges-permissions/conges/${demande.entite_id}/status`
        : `/conges-permissions/permissions/${demande.entite_id}/status`;
      
      await API.put(endpoint, {
        statut: 'approuve',
        validateur_name: 'Admin CFP'
      });

      // Marquer la notification comme lue
      await marquerCommeLue(demande.id);
      
      // Recharger les notifications
      loadNotifications();
      
      // Fermer les détails si ouverts
      setShowDetails(false);
      setSelectedDemande(null);
    } catch (error) {
      console.error('Erreur approbation demande:', error);
    }
  };

  // Refuser une demande
  const refuserDemande = async (demande, motifRefus) => {
    try {
      const endpoint = demande.entite_type === 'conge' 
        ? `/conges-permissions/conges/${demande.entite_id}/status`
        : `/conges-permissions/permissions/${demande.entite_id}/status`;
      
      await API.put(endpoint, {
        statut: 'refuse',
        validateur_name: 'Admin CFP',
        motif_refus: motifRefus
      });

      // Marquer la notification comme lue
      await marquerCommeLue(demande.id);
      
      // Recharger les notifications
      loadNotifications();
      
      // Fermer les détails si ouverts
      setShowDetails(false);
      setSelectedDemande(null);
    } catch (error) {
      console.error('Erreur refus demande:', error);
    }
  };

  // Obtenir les détails complets d'une demande
  const getDemandeDetails = async (demande) => {
    try {
      const endpoint = demande.entite_type === 'conge' 
        ? `/conges-permissions/conges/en-attente`
        : `/conges-permissions/permissions/en-attente`;
      
      const response = await API.get(endpoint);
      const details = response.data.find(d => d.id === demande.entite_id);
      
      if (details) {
        setSelectedDemande(details);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Erreur récupération détails:', error);
    }
  };

  // Télécharger un document
  const downloadDocument = (filename) => {
    const apiBase = (API.defaults?.baseURL || '').replace(/\/api\/?$/, '');
    const clean = String(filename).replace(/^\/+/, '');
    window.open(`${apiBase}/uploads/documents/${clean}`, '_blank');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'conge_demande':
        return <FiCalendar className="w-5 h-5 text-blue-500" />;
      case 'permission_demande':
        return <FiClock className="w-5 h-5 text-green-500" />;
      case 'conge_approuve':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'conge_refuse':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      case 'permission_approuve':
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case 'permission_refuse':
        return <FiXCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'conge_demande':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'permission_demande':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'conge_approuve':
      case 'permission_approuve':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'conge_refuse':
      case 'permission_refuse':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiBell className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Notifications Admin</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-purple-100 mt-2">
                {notifications.length} notification(s) en attente
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune notification en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${getNotificationColor(notification.type_notification)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type_notification)}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {notification.titre}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <FiUser className="w-3 h-3" />
                            <span>{notification.user_name}</span>
                            <FiMail className="w-3 h-3 ml-2" />
                            <span>{notification.user_email}</span>
                          </div>

                          {/* Actions rapides pour les demandes */}
                          {(notification.type_notification === 'conge_demande' || 
                            notification.type_notification === 'permission_demande') && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => getDemandeDetails(notification)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                              >
                                <FiEye className="w-3 h-3" />
                                Voir détails
                              </button>
                              <button
                                onClick={() => approuverDemande(notification)}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                              >
                                <FiCheck className="w-3 h-3" />
                                Approuver
                              </button>
                              <button
                                onClick={() => {
                                  const motif = prompt('Motif du refus :');
                                  if (motif) {
                                    refuserDemande(notification, motif);
                                  }
                                }}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                              >
                                <FiXCircle className="w-3 h-3" />
                                Refuser
                              </button>
                            </div>
                          )}

                          {/* Marquer comme lu pour les autres notifications */}
                          {!['conge_demande', 'permission_demande'].includes(notification.type_notification) && (
                            <button
                              onClick={() => marquerCommeLue(notification.id)}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Modal Détails Demande */}
          <AnimatePresence>
            {showDetails && selectedDemande && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
                onClick={() => setShowDetails(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        Détails de la demande de {selectedDemande.entite_type === 'conge' ? 'congé' : 'permission'}
                      </h3>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Informations utilisateur */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-700">Informations du demandeur</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Nom:</span>
                          <span className="ml-2 font-medium">{selectedDemande.user_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2 font-medium">{selectedDemande.user_email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rôle:</span>
                          <span className="ml-2 font-medium capitalize">{selectedDemande.user_role}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date demande:</span>
                          <span className="ml-2 font-medium">
                            {new Date(selectedDemande.date_demande).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Détails de la demande */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-gray-700">Détails de la demande</h4>
                      <div className="space-y-2 text-sm">
                        {selectedDemande.entite_type === 'conge' ? (
                          <>
                            <div>
                              <span className="text-gray-500">Type de congé:</span>
                              <span className="ml-2 font-medium capitalize">{selectedDemande.type_conge}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Période:</span>
                              <span className="ml-2 font-medium">
                                du {new Date(selectedDemande.date_debut).toLocaleDateString('fr-FR')} 
                                au {new Date(selectedDemande.date_fin).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Nombre de jours:</span>
                              <span className="ml-2 font-medium">{selectedDemande.jours_demandes} jours</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="text-gray-500">Type de permission:</span>
                              <span className="ml-2 font-medium capitalize">{selectedDemande.type_permission}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <span className="ml-2 font-medium">
                                {new Date(selectedDemande.date_permission).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Horaire:</span>
                              <span className="ml-2 font-medium">
                                de {selectedDemande.heure_debut} à {selectedDemande.heure_fin}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <span className="ml-2 font-medium">{selectedDemande.duree} heures</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Retour prévu:</span>
                              <span className="ml-2 font-medium">{selectedDemande.retour_prevu || 'Non spécifié'}</span>
                            </div>
                          </>
                        )}
                        
                        <div>
                          <span className="text-gray-500">Motif:</span>
                          <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                            {selectedDemande.motif}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">Contact d'urgence:</span>
                          <span className="ml-2 font-medium">{selectedDemande.contact_urgence}</span>
                          <span className="ml-2 text-gray-600">({selectedDemande.telephone_urgence})</span>
                        </div>
                      </div>
                    </div>

                    {/* Documents */}
                    {selectedDemande.documents && selectedDemande.documents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-gray-700">Documents joints</h4>
                        <div className="space-y-2">
                          {selectedDemande.documents.map((doc, index) => (
                            <button
                              key={index}
                              onClick={() => downloadDocument(doc)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
                            >
                              <FiDownload className="w-4 h-4" />
                              {doc}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => {
                          const notification = notifications.find(n => n.entite_id === selectedDemande.id);
                          if (notification) {
                            approuverDemande(notification);
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <FiCheck className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() => {
                          const motif = prompt('Motif du refus :');
                          if (motif) {
                            const notification = notifications.find(n => n.entite_id === selectedDemande.id);
                            if (notification) {
                              refuserDemande(notification, motif);
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <FiXCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanelAdmin;
