import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMail,
  FiMessageSquare,
  FiTrendingUp,
  FiUsers,
  FiCalendar as FiCalendarIcon,
  FiActivity,
  FiBarChart2
} from 'react-icons/fi';
import API from '../../services/api';

export default function GestionPermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    typePermission: 'personnel',
    date: '',
    heureDebut: '',
    heureFin: '',
    motif: '',
    documents: []
  });
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuves: 0,
    refuses: 0,
    aujourdHui: 0,
    cetteSemaine: 0
  });

  useEffect(() => {
    fetchPermissions();
    fetchStats();
  }, []);

  const fetchPermissions = async () => {
    try {
      // Simulation - remplacer par vrai appel API
      const mockPermissions = [
        {
          id: 1,
          userId: 1,
          userName: 'Jean Rakoto',
          userEmail: 'jean@example.com',
          typePermission: 'personnel',
          date: '2024-02-05',
          heureDebut: '09:00',
          heureFin: '12:00',
          motif: 'Rendez-vous médical',
          statut: 'en_attente',
          dateDemande: '2024-02-04',
          documents: ['ordonnance.pdf'],
          duree: '3 heures'
        },
        {
          id: 2,
          userId: 2,
          userName: 'Marie Razafy',
          userEmail: 'marie@example.com',
          typePermission: 'professionnel',
          date: '2024-02-06',
          heureDebut: '14:00',
          heureFin: '17:00',
          motif: 'Formation externe',
          statut: 'approuve',
          dateDemande: '2024-02-03',
          documents: ['invitation.pdf'],
          duree: '3 heures'
        },
        {
          id: 3,
          userId: 3,
          userName: 'Paul Andria',
          userEmail: 'paul@example.com',
          typePermission: 'exceptionnel',
          date: '2024-02-07',
          heureDebut: '10:00',
          heureFin: '11:30',
          motif: 'Urgence familiale',
          statut: 'en_cours',
          dateDemande: '2024-02-07',
          documents: [],
          duree: '1.5 heures'
        },
        {
          id: 4,
          userId: 4,
          userName: 'Sophie Randria',
          userEmail: 'sophie@example.com',
          typePermission: 'personnel',
          date: '2024-02-08',
          heureDebut: '08:00',
          heureFin: '10:00',
          motif: 'Démarches administratives',
          statut: 'refuse',
          dateDemande: '2024-02-05',
          documents: [],
          duree: '2 heures'
        }
      ];
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulation
      setStats({
        total: 28,
        enAttente: 5,
        approuves: 20,
        refuses: 3,
        aujourdHui: 2,
        cetteSemaine: 8
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateDuree = (heureDebut, heureFin) => {
    const debut = new Date(`2000-01-01T${heureDebut}`);
    const fin = new Date(`2000-01-01T${heureFin}`);
    const diffTime = Math.abs(fin - debut);
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours;
  };

  const handleStatusChange = async (permissionId, newStatus) => {
    try {
      // API call to update status
      setPermissions(permissions.map(permission => 
        permission.id === permissionId ? { ...permission, statut: newStatus } : permission
      ));
      
      // Send notification
      await sendNotification(permissionId, newStatus);
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendNotification = async (permissionId, status) => {
    // Simulation d'envoi de notification
    console.log(`Notification envoyée pour la permission ${permissionId}: ${status}`);
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.motif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || permission.statut === filterStatus;
    const matchesType = filterType === 'all' || permission.typePermission === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'approuve': return 'text-green-600 bg-green-100';
      case 'refuse': return 'text-red-600 bg-red-100';
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'en_cours': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'approuve': return <FiCheckCircle />;
      case 'refuse': return <FiXCircle />;
      case 'en_attente': return <FiAlertCircle />;
      case 'en_cours': return <FiClock />;
      default: return <FiClock />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'personnel': return 'text-blue-600 bg-blue-100';
      case 'professionnel': return 'text-purple-600 bg-purple-100';
      case 'exceptionnel': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isToday = (date) => {
    const today = new Date();
    const permissionDate = new Date(date);
    return permissionDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const permissionDate = new Date(date);
    const diffTime = Math.abs(permissionDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Permissions</h1>
        <p className="text-gray-600">Gérez les demandes de permissions de 1 à 5 jours maximum</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiCalendar className="text-3xl text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            </div>
            <FiAlertCircle className="text-3xl text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvés</p>
              <p className="text-2xl font-bold text-green-600">{stats.approuves}</p>
            </div>
            <FiCheckCircle className="text-3xl text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refusés</p>
              <p className="text-2xl font-bold text-red-600">{stats.refuses}</p>
            </div>
            <FiXCircle className="text-3xl text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-purple-600">{stats.aujourdHui}</p>
            </div>
            <FiActivity className="text-3xl text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.cetteSemaine}</p>
            </div>
            <FiBarChart2 className="text-3xl text-indigo-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvés</option>
              <option value="refuse">Refusés</option>
              <option value="en_cours">En cours</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="personnel">Personnel</option>
              <option value="professionnel">Professionnel</option>
              <option value="exceptionnel">Exceptionnel</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FiDownload />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horaires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map((permission) => (
                <motion.tr
                  key={permission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 ${isToday(permission.date) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.userName}</div>
                      <div className="text-sm text-gray-500">{permission.userEmail}</div>
                      {isToday(permission.date) && (
                        <span className="text-xs text-blue-600 font-medium">Aujourd'hui</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(permission.typePermission)}`}>
                      {permission.typePermission}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(permission.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Demandé le {new Date(permission.dateDemande).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {permission.heureDebut} - {permission.heureFin}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {permission.duree}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={permission.motif}>
                      {permission.motif}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(permission.statut)}`}>
                      {getStatusIcon(permission.statut)}
                      <span className="ml-1">
                        {permission.statut === 'en_attente' ? 'En attente' :
                         permission.statut === 'approuve' ? 'Approuvé' :
                         permission.statut === 'refuse' ? 'Refusé' : 'En cours'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPermission(permission)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setSelectedPermission(permission);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Approuver"
                        disabled={permission.statut !== 'en_attente'}
                      >
                        <FiCheckCircle />
                      </button>
                      <button
                        onClick={() => handleStatusChange(permission.id, 'refuse')}
                        className="text-red-600 hover:text-red-900"
                        title="Refuser"
                        disabled={permission.statut !== 'en_attente'}
                      >
                        <FiXCircle />
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${permission.userEmail}`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Envoyer un email"
                      >
                        <FiMail />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Détails de la Permission</h2>
              <button
                onClick={() => setSelectedPermission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Employé</p>
                <p className="font-medium">{selectedPermission.userName}</p>
                <p className="text-sm text-gray-500">{selectedPermission.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type de permission</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedPermission.typePermission)}`}>
                  {selectedPermission.typePermission}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(selectedPermission.date).toLocaleDateString('fr-FR')}</p>
                {isToday(selectedPermission.date) && (
                  <p className="text-sm text-blue-600 font-medium">Aujourd'hui</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Horaires</p>
                <p className="font-medium">{selectedPermission.heureDebut} - {selectedPermission.heureFin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="font-medium">{selectedPermission.duree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPermission.statut)}`}>
                  {getStatusIcon(selectedPermission.statut)}
                  <span className="ml-1">
                    {selectedPermission.statut === 'en_attente' ? 'En attente' :
                     selectedPermission.statut === 'approuve' ? 'Approuvé' :
                     selectedPermission.statut === 'refuse' ? 'Refusé' : 'En cours'}
                  </span>
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Motif</p>
              <p className="text-gray-900">{selectedPermission.motif}</p>
            </div>

            {selectedPermission.documents.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedPermission.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FiEye />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {selectedPermission.statut === 'en_attente' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPermission.id, 'approuve');
                      setSelectedPermission(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedPermission.id, 'refuse');
                      setSelectedPermission(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Refuser
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedPermission(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
