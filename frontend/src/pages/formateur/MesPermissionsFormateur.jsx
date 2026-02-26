import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiFilter,
  FiSearch,
  FiDownload,
  FiMail,
  FiRefreshCw,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

export default function MesPermissionsFormateur() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuves: 0,
    refuses: 0,
    enCours: 0,
    aujourdHui: 0,
    ceMois: 0,
    heuresPrises: 0,
    heuresRestantes: 40
  });

  useEffect(() => {
    fetchPermissions();
    fetchStats();
  }, [filterMonth, filterYear]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // Simulation - remplacer par vrai appel API
      const mockPermissions = [
        {
          id: 1,
          typePermission: 'personnel',
          date: '2024-02-05',
          heureDebut: '09:00',
          heureFin: '12:00',
          motif: 'Rendez-vous médical chez le spécialiste',
          statut: 'approuve',
          dateDemande: '2024-02-03',
          dateValidation: '2024-02-04',
          validateur: 'Admin CFP',
          documents: ['ordonnance.pdf'],
          duree: 3,
          retourPrevu: '13:30',
          contactUrgence: 'Marie Rakoto',
          telephoneUrgence: '+261 32 00 000 01'
        },
        {
          id: 2,
          typePermission: 'professionnel',
          date: '2024-02-08',
          heureDebut: '14:00',
          heureFin: '17:00',
          motif: 'Formation sur les nouvelles techniques pédagogiques',
          statut: 'en_attente',
          dateDemande: '2024-02-06',
          documents: ['invitation.pdf', 'programme.pdf'],
          duree: 3,
          retourPrevu: '17:30',
          contactUrgence: 'Jean Razafy',
          telephoneUrgence: '+261 34 00 000 02'
        },
        {
          id: 3,
          typePermission: 'exceptionnel',
          date: '2024-02-12',
          heureDebut: '10:00',
          heureFin: '11:30',
          motif: 'Urgence familiale - problème à résoudre en mairie',
          statut: 'refuse',
          dateDemande: '2024-02-11',
          dateValidation: '2024-02-11',
          motifRefus: 'Créneau horaire non compatible avec les cours prévus',
          validateur: 'Admin CFP',
          duree: 1.5,
          contactUrgence: 'Paul Andria',
          telephoneUrgence: '+261 33 00 000 03'
        },
        {
          id: 4,
          typePermission: 'personnel',
          date: '2024-02-15',
          heureDebut: '08:00',
          heureFin: '10:00',
          motif: 'Démarches administratives à la banque',
          statut: 'en_cours',
          dateDemande: '2024-02-14',
          dateValidation: '2024-02-14',
          validateur: 'Admin CFP',
          duree: 2,
          retourPrevu: '10:30',
          contactUrgence: 'Sophie Randria',
          telephoneUrgence: '+261 32 00 000 04'
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
        total: 4,
        enAttente: 1,
        approuves: 1,
        refuses: 1,
        enCours: 1,
        aujourdHui: 1,
        ceMois: 3,
        heuresPrises: 6.5,
        heuresRestantes: 33.5
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.typePermission.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || permission.statut === filterStatus;
    const permissionDate = new Date(permission.date);
    const matchesMonth = permissionDate.getMonth() === filterMonth;
    const matchesYear = permissionDate.getFullYear() === filterYear;
    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
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

  const isToday = (permission) => {
    const today = new Date();
    const permissionDate = new Date(permission.date);
    return permissionDate.toDateString() === today.toDateString();
  };

  const isCurrentPermission = (permission) => {
    const now = new Date();
    const permissionDate = new Date(permission.date);
    const today = new Date();
    
    if (permissionDate.toDateString() !== today.toDateString()) {
      return false;
    }
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const debutTime = parseInt(permission.heureDebut.split(':')[0]) * 60 + parseInt(permission.heureDebut.split(':')[1]);
    const finTime = parseInt(permission.heureFin.split(':')[0]) * 60 + parseInt(permission.heureFin.split(':')[1]);
    
    return currentTime >= debutTime && currentTime <= finTime && permission.statut === 'en_cours';
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Permissions</h1>
        <p className="text-gray-600">Consultez l'historique et le statut de vos demandes de permission</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-6 mb-8">
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
            <FiCalendar className="text-3xl text-purple-600" />
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
              <p className="text-sm text-gray-600">Approuvées</p>
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
              <p className="text-sm text-gray-600">Refusées</p>
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
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.enCours}</p>
            </div>
            <FiClock className="text-3xl text-blue-600" />
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
              <p className="text-sm text-gray-600">Aujourd'hui</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.aujourdHui}</p>
            </div>
            <FiActivity className="text-3xl text-indigo-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heures prises</p>
              <p className="text-2xl font-bold text-orange-600">{stats.heuresPrises}h</p>
            </div>
            <FiTrendingUp className="text-3xl text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Restantes</p>
              <p className="text-2xl font-bold text-green-600">{stats.heuresRestantes}h</p>
            </div>
            <FiUser className="text-3xl text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Alertes */}
      {permissions.some(isCurrentPermission) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <FiActivity className="text-purple-600" />
            <span className="text-purple-800 font-medium">
              Vous êtes actuellement en permission !
            </span>
          </div>
        </motion.div>
      )}

      {permissions.some(isToday) && !permissions.some(isCurrentPermission) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-green-600" />
            <span className="text-green-800 font-medium">
              Vous avez une permission aujourd'hui !
            </span>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par motif ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvées</option>
              <option value="refuse">Refusées</option>
              <option value="en_cours">En cours</option>
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <FiDownload />
              Exporter
            </button>
            <button
              onClick={() => {
                fetchPermissions();
                fetchStats();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw />
              Actualiser
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
                  className={`hover:bg-gray-50 ${isToday(permission) ? 'bg-purple-50' : ''} ${isCurrentPermission(permission) ? 'bg-purple-100' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(permission.typePermission)}`}>
                      {permission.typePermission}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(permission.date).toLocaleDateString('fr-FR')}
                    </div>
                    {isToday(permission) && (
                      <span className="text-xs text-purple-600 font-medium">
                        {isCurrentPermission(permission) ? 'En cours' : 'Aujourd\'hui'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {permission.heureDebut} - {permission.heureFin}
                    </div>
                    {permission.retourPrevu && (
                      <div className="text-xs text-gray-500">
                        Retour: {permission.retourPrevu}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {permission.duree}h
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
                         permission.statut === 'approuve' ? 'Approuvée' :
                         permission.statut === 'refuse' ? 'Refusée' : 'En cours'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPermission(permission)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Voir les détails"
                      >
                        <FiEye />
                      </button>
                      {permission.statut === 'en_attente' && (
                        <button
                          onClick={() => window.open('mailto:admin@cfp.mg?subject=Annulation demande de permission')}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler la demande"
                        >
                          <FiXCircle />
                        </button>
                      )}
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
            className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Détails de la Permission</h2>
              <button
                onClick={() => setSelectedPermission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Type de permission</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedPermission.typePermission)}`}>
                  {selectedPermission.typePermission}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Statut</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPermission.statut)}`}>
                  {getStatusIcon(selectedPermission.statut)}
                  <span className="ml-1">
                    {selectedPermission.statut === 'en_attente' ? 'En attente' :
                     selectedPermission.statut === 'approuve' ? 'Approuvée' :
                     selectedPermission.statut === 'refuse' ? 'Refusée' : 'En cours'}
                  </span>
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Date</p>
                <p className="font-medium">{new Date(selectedPermission.date).toLocaleDateString('fr-FR')}</p>
                {isToday(selectedPermission) && (
                  <p className="text-sm text-purple-600 font-medium">Aujourd'hui</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Horaires</p>
                <p className="font-medium">{selectedPermission.heureDebut} - {selectedPermission.heureFin}</p>
                {selectedPermission.retourPrevu && (
                  <p className="text-sm text-gray-500">Retour prévu: {selectedPermission.retourPrevu}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Durée</p>
                <p className="font-medium">{selectedPermission.duree} heures</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Contact d'urgence</p>
                <p className="font-medium">{selectedPermission.contactUrgence}</p>
                <p className="text-sm text-gray-500">{selectedPermission.telephoneUrgence}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Motif</p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPermission.motif}</p>
            </div>

            {selectedPermission.motifRefus && (
              <div className="mb-6">
                <p className="text-sm text-red-600 mb-2">Motif du refus</p>
                <p className="text-red-900 bg-red-50 p-3 rounded-lg">{selectedPermission.motifRefus}</p>
              </div>
            )}

            {selectedPermission.documents && selectedPermission.documents.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedPermission.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 cursor-pointer bg-purple-50 p-2 rounded">
                      <FiEye />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Date de demande</p>
                <p className="font-medium">{new Date(selectedPermission.dateDemande).toLocaleDateString('fr-FR')}</p>
              </div>
              {selectedPermission.dateValidation && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Validé par</p>
                  <p className="font-medium">{selectedPermission.validateur}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedPermission.dateValidation).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {selectedPermission.statut === 'en_attente' && (
                <button
                  onClick={() => window.open('mailto:admin@cfp.mg?subject=Annulation demande de permission')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Annuler la demande
                </button>
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
