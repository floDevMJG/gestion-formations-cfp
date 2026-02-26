import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiCalendar,
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
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

export default function MesCongesFormateur() {
  const { user } = useAuth();
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedConge, setSelectedConge] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    approuves: 0,
    refuses: 0,
    enCours: 0,
    joursPris: 0,
    joursRestants: 0
  });

  useEffect(() => {
    fetchConges();
    fetchStats();
  }, [filterYear]);

  const fetchConges = async () => {
    try {
      setLoading(true);
      // Simulation - remplacer par vrai appel API
      const mockConges = [
        {
          id: 1,
          typeConge: 'annuel',
          dateDebut: '2024-01-15',
          dateFin: '2024-02-05',
          motif: 'Voyage familial à Madagascar',
          statut: 'approuve',
          dateDemande: '2024-01-05',
          dateValidation: '2024-01-08',
          validateur: 'Admin CFP',
          documents: ['reservation.pdf', 'billets.pdf'],
          jours: 22,
          contactUrgence: 'Marie Rakoto',
          telephoneUrgence: '+261 32 00 000 01'
        },
        {
          id: 2,
          typeConge: 'maladie',
          dateDebut: '2024-03-10',
          dateFin: '2024-03-15',
          motif: 'Convalescence post-opératoire',
          statut: 'en_attente',
          dateDemande: '2024-03-08',
          documents: ['certificat.pdf', 'ordonnance.pdf'],
          jours: 6,
          contactUrgence: 'Jean Razafy',
          telephoneUrgence: '+261 34 00 000 02'
        },
        {
          id: 3,
          typeConge: 'exceptionnel',
          dateDebut: '2024-02-20',
          dateFin: '2024-02-25',
          motif: 'Démarches administratives importantes',
          statut: 'refuse',
          dateDemande: '2024-02-15',
          dateValidation: '2024-02-18',
          motifRefus: 'Période non autorisée - sessions de formation en cours',
          validateur: 'Admin CFP',
          jours: 6,
          contactUrgence: 'Paul Andria',
          telephoneUrgence: '+261 33 00 000 03'
        },
        {
          id: 4,
          typeConge: 'annuel',
          dateDebut: '2024-06-01',
          dateFin: '2024-06-20',
          motif: 'Vacances d\'été',
          statut: 'en_cours',
          dateDemande: '2024-05-15',
          dateValidation: '2024-05-18',
          validateur: 'Admin CFP',
          documents: [],
          jours: 20,
          contactUrgence: 'Sophie Randria',
          telephoneUrgence: '+261 32 00 000 04'
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
        total: 4,
        enAttente: 1,
        approuves: 1,
        refuses: 1,
        enCours: 1,
        joursPris: 22,
        joursRestants: 8
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredConges = conges.filter(conge => {
    const matchesSearch = conge.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conge.typeConge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || conge.statut === filterStatus;
    const matchesYear = new Date(conge.dateDebut).getFullYear() === filterYear;
    return matchesSearch && matchesStatus && matchesYear;
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
      case 'annuel': return 'text-blue-600 bg-blue-100';
      case 'maladie': return 'text-red-600 bg-red-100';
      case 'maternite': return 'text-pink-600 bg-pink-100';
      case 'exceptionnel': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isCurrentConge = (conge) => {
    const now = new Date();
    const debut = new Date(conge.dateDebut);
    const fin = new Date(conge.dateFin);
    return now >= debut && now <= fin && conge.statut === 'en_cours';
  };

  const isUpcomingConge = (conge) => {
    const now = new Date();
    const debut = new Date(conge.dateDebut);
    return debut > now && (conge.statut === 'approuve' || conge.statut === 'en_cours');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Congés</h1>
        <p className="text-gray-600">Consultez l'historique et le statut de vos demandes de congé</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jours pris</p>
              <p className="text-2xl font-bold text-orange-600">{stats.joursPris}</p>
            </div>
            <FiTrendingUp className="text-3xl text-orange-600" />
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
              <p className="text-sm text-gray-600">Jours restants</p>
              <p className="text-2xl font-bold text-green-600">{stats.joursRestants}</p>
            </div>
            <FiActivity className="text-3xl text-green-600" />
          </div>
        </motion.div>
      </div>

      {/* Alertes */}
      {conges.some(isCurrentConge) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <FiActivity className="text-blue-600" />
            <span className="text-blue-800 font-medium">
              Vous êtes actuellement en congé !
            </span>
          </div>
        </motion.div>
      )}

      {conges.some(isUpcomingConge) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-green-600" />
            <span className="text-green-800 font-medium">
              Vous avez un congé approuvé à venir !
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
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <FiDownload />
              Exporter
            </button>
            <button
              onClick={() => {
                fetchConges();
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

      {/* Congés Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
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
                  Dates
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
                  className={`hover:bg-gray-50 ${isCurrentConge(conge) ? 'bg-blue-50' : ''} ${isUpcomingConge(conge) ? 'bg-green-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(conge.typeConge)}`}>
                      {conge.typeConge}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(conge.dateDebut).toLocaleDateString('fr-FR')} - {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                    {isCurrentConge(conge) && (
                      <span className="text-xs text-blue-600 font-medium">En cours</span>
                    )}
                    {isUpcomingConge(conge) && !isCurrentConge(conge) && (
                      <span className="text-xs text-green-600 font-medium">À venir</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {conge.jours} jours
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      <div>Demandé: {new Date(conge.dateDemande).toLocaleDateString('fr-FR')}</div>
                      {conge.dateValidation && (
                        <div>Validé: {new Date(conge.dateValidation).toLocaleDateString('fr-FR')}</div>
                      )}
                    </div>
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
                      {conge.statut === 'en_attente' && (
                        <button
                          onClick={() => window.open('mailto:admin@cfp.mg?subject=Annulation demande de congé')}
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
      {selectedConge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Détails du Congé</h2>
              <button
                onClick={() => setSelectedConge(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Type de congé</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(selectedConge.typeConge)}`}>
                  {selectedConge.typeConge}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Statut</p>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedConge.statut)}`}>
                  {getStatusIcon(selectedConge.statut)}
                  <span className="ml-1">
                    {selectedConge.statut === 'en_attente' ? 'En attente' :
                     selectedConge.statut === 'approuve' ? 'Approuvé' :
                     selectedConge.statut === 'refuse' ? 'Refusé' : 'En cours'}
                  </span>
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Date de début</p>
                <p className="font-medium">{new Date(selectedConge.dateDebut).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Date de fin</p>
                <p className="font-medium">{new Date(selectedConge.dateFin).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Durée</p>
                <p className="font-medium">{selectedConge.jours} jours</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Contact d'urgence</p>
                <p className="font-medium">{selectedConge.contactUrgence}</p>
                <p className="text-sm text-gray-500">{selectedConge.telephoneUrgence}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Motif</p>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedConge.motif}</p>
            </div>

            {selectedConge.motifRefus && (
              <div className="mb-6">
                <p className="text-sm text-red-600 mb-2">Motif du refus</p>
                <p className="text-red-900 bg-red-50 p-3 rounded-lg">{selectedConge.motifRefus}</p>
              </div>
            )}

            {selectedConge.documents && selectedConge.documents.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedConge.documents.map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 p-2 rounded">
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
                <p className="font-medium">{new Date(selectedConge.dateDemande).toLocaleDateString('fr-FR')}</p>
              </div>
              {selectedConge.dateValidation && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Validé par</p>
                  <p className="font-medium">{selectedConge.validateur}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedConge.dateValidation).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {selectedConge.statut === 'en_attente' && (
                <button
                  onClick={() => window.open('mailto:admin@cfp.mg?subject=Annulation demande de congé')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Annuler la demande
                </button>
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
