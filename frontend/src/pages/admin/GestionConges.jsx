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
  FiCalendar as FiCalendarIcon
} from 'react-icons/fi';
import API from '../../services/api';

export default function GestionConges() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedConge, setSelectedConge] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    typeConge: 'annuel',
    dateDebut: '',
    dateFin: '',
    motif: '',
    documents: []
  });
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuves: 0,
    refuses: 0,
    enCours: 0
  });

  useEffect(() => {
    fetchConges();
    fetchStats();
  }, []);

  const fetchConges = async () => {
    try {
      // Simulation - remplacer par vrai appel API
      const mockConges = [
        {
          id: 1,
          userId: 1,
          userName: 'Jean Rakoto',
          userEmail: 'jean@example.com',
          typeConge: 'annuel',
          dateDebut: '2024-02-15',
          dateFin: '2024-03-05',
          motif: 'Voyage familial',
          statut: 'en_attente',
          dateDemande: '2024-02-01',
          documents: ['attestation.pdf'],
          joursRestants: 15
        },
        {
          id: 2,
          userId: 2,
          userName: 'Marie Razafy',
          userEmail: 'marie@example.com',
          typeConge: 'maladie',
          dateDebut: '2024-02-10',
          dateFin: '2024-02-20',
          motif: 'Convalescence',
          statut: 'approuve',
          dateDemande: '2024-02-05',
          documents: ['certificat.pdf'],
          joursRestants: 20
        },
        {
          id: 3,
          userId: 3,
          userName: 'Paul Andria',
          userEmail: 'paul@example.com',
          typeConge: 'exceptionnel',
          dateDebut: '2024-02-25',
          dateFin: '2024-03-10',
          motif: 'Projet personnel',
          statut: 'en_cours',
          dateDemande: '2024-02-08',
          documents: [],
          joursRestants: 12
        }
      ];
      setConges(mockConges);
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
        total: 45,
        enAttente: 8,
        approuves: 32,
        refuses: 3,
        enCours: 2
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const calculateJours = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleStatusChange = async (congeId, newStatus) => {
    try {
      // API call to update status
      setConges(conges.map(conge => 
        conge.id === congeId ? { ...conge, statut: newStatus } : conge
      ));
      
      // Send notification
      await sendNotification(congeId, newStatus);
      
      // Update stats
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendNotification = async (congeId, status) => {
    // Simulation d'envoi de notification
    console.log(`Notification envoyée pour le congé ${congeId}: ${status}`);
  };

  const filteredConges = conges.filter(conge => {
    const matchesSearch = conge.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conge.motif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || conge.statut === filterStatus;
    return matchesSearch && matchesFilter;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Congés</h1>
        <p className="text-gray-600">Gérez les demandes de congés de plus de 10 jours</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.enCours}</p>
            </div>
            <FiClock className="text-3xl text-blue-600" />
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FiDownload />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Congés Table */}
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
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jours
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
              {filteredConges.map((conge) => (
                <motion.tr
                  key={conge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{conge.userName}</div>
                      <div className="text-sm text-gray-500">{conge.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {conge.typeConge}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(conge.dateDebut).toLocaleDateString('fr-FR')} - {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Demandé le {new Date(conge.dateDemande).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateJours(conge.dateDebut, conge.dateFin)} jours
                    </div>
                    <div className="text-xs text-gray-500">
                      {conge.joursRestants} restants
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={conge.motif}>
                      {conge.motif}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conge.statut)}`}>
                      {getStatusIcon(conge.statut)}
                      <span className="ml-1">
                        {conge.statut === 'en_attente' ? 'En attente' :
                         conge.statut === 'approuve' ? 'Approuvé' :
                         conge.statut === 'refuse' ? 'Refusé' : 'En cours'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedConge(conge)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Voir les détails"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setSelectedConge(conge);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Approuver"
                        disabled={conge.statut !== 'en_attente'}
                      >
                        <FiCheckCircle />
                      </button>
                      <button
                        onClick={() => handleStatusChange(conge.id, 'refuse')}
                        className="text-red-600 hover:text-red-900"
                        title="Refuser"
                        disabled={conge.statut !== 'en_attente'}
                      >
                        <FiXCircle />
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${conge.userEmail}`)}
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
      {selectedConge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Détails du Congé</h2>
              <button
                onClick={() => setSelectedConge(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Employé</p>
                <p className="font-medium">{selectedConge.userName}</p>
                <p className="text-sm text-gray-500">{selectedConge.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type de congé</p>
                <p className="font-medium capitalize">{selectedConge.typeConge}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="font-medium">{new Date(selectedConge.dateDebut).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de fin</p>
                <p className="font-medium">{new Date(selectedConge.dateFin).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="font-medium">{calculateJours(selectedConge.dateDebut, selectedConge.dateFin)} jours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedConge.statut)}`}>
                  {getStatusIcon(selectedConge.statut)}
                  <span className="ml-1">
                    {selectedConge.statut === 'en_attente' ? 'En attente' :
                     selectedConge.statut === 'approuve' ? 'Approuvé' :
                     selectedConge.statut === 'refuse' ? 'Refusé' : 'En cours'}
                  </span>
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Motif</p>
              <p className="text-gray-900">{selectedConge.motif}</p>
            </div>

            {selectedConge.documents.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedConge.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FiEye />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {selectedConge.statut === 'en_attente' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedConge.id, 'approuve');
                      setSelectedConge(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedConge.id, 'refuse');
                      setSelectedConge(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Refuser
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedConge(null)}
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
