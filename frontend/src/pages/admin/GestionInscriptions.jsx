import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { FaUserGraduate, FaChalkboardTeacher, FaShip, FaTools } from 'react-icons/fa';
import API from '../../services/api';
import { toast } from 'react-toastify';

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Composant de carte d'inscription
const InscriptionCard = ({ inscription, onStatusChange, disabled = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'validee':
        return <FiCheckCircle className="text-green-500 text-xl" />;
      case 'refusee':
        return <FiXCircle className="text-red-500 text-xl" />;
      case 'en_attente':
      default:
        return <FiClock className="text-yellow-500 text-xl" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'validee':
        return 'bg-green-100 text-green-800';
      case 'refusee':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getFormationIcon = (titre) => {
    if (titre?.includes('Charpente')) return <FaShip className="text-blue-600" />;
    if (titre?.includes('Mécanique')) return <FaTools className="text-indigo-600" />;
    return <FaChalkboardTeacher className="text-purple-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaUserGraduate className="text-blue-600" />
              {inscription.prenom} {inscription.nom}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{inscription.email}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inscription.statutPaiement)}`}>
            {getStatusIcon(inscription.statutPaiement)}
            <span className="ml-1">
              {inscription.statutPaiement === 'validee' ? 'Validée' : 
               inscription.statutPaiement === 'refusee' ? 'Refusée' : 'En attente'}
            </span>
          </span>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            {getFormationIcon(inscription.formation_titre)}
            <span className="ml-2 font-medium">Formation :</span>
            <span className="ml-2 text-gray-800">
              {inscription.formation_titre || 'Non spécifiée'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-500">Date d'inscription</p>
              <p className="font-medium">
                {new Date(inscription.dateInscription).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Montant</p>
              <p className="font-medium">
                {inscription.montant ? `${inscription.montant} FCFA` : 'Non spécifié'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
          {inscription.statutPaiement === 'en_attente' && (
            <div className="mt-4 flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => onStatusChange(inscription.id, 'validee')}
                disabled={disabled}
                className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {disabled ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Valider
                  </>
                )}
              </button>
              <button
                onClick={() => onStatusChange(inscription.id, 'refusee')}
                disabled={disabled}
                className={`px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiXCircle className="w-4 h-4" />
                Refuser
              </button>
            </div>
          )}
          {inscription.statutPaiement !== 'en_attente' && (
            <button
              onClick={() => onStatusChange(inscription.id, 'en_attente')}
              className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-md hover:bg-yellow-100 transition-colors"
            >
              <FiClock className="w-4 h-4" />
              En attente
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function GestionInscriptions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    statut: searchParams.get('statut') || 'tous',
    formation: searchParams.get('formation') || 'tous',
    search: searchParams.get('search') || ''
  });
  const [formations, setFormations] = useState([]);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      // L'URL de base contient déjà /api, donc on commence directement par /admin
      const response = await API.get('/inscriptions');
      console.log('Réponse de l\'API:', response.data);
      setInscriptions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des inscriptions:', error);
      console.error('URL de la requête:', error.config?.url);
      console.error('Détails de l\'erreur:', error.response?.data || error.message);
      toast.error('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateInscriptionStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      console.log(`Mise à jour du statut de l'inscription ${id} à ${newStatus}`);
      const url = `/inscriptions/${id}/status`;
      const body = { status: newStatus };
      console.log('URL de la requête:', url);
      console.log('Corps de la requête:', body);
      await API.put(url, body);
      
      setInscriptions(prevInscriptions => 
        prevInscriptions.map(inscription => 
          inscription.id === id 
            ? { ...inscription, statutPaiement: newStatus }
            : inscription
        )
      );
      
      toast.success(`Inscription ${newStatus === 'validee' ? 'validée' : 'refusée'} avec succès`);
    } catch (error) {
      console.error('Erreur détaillée lors de la mise à jour du statut:', error.response || error.request || error.message);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchInscriptions();
  };

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const filteredInscriptions = inscriptions.filter((inscription) => {
    if (filters.statut !== 'tous' && inscription.statutPaiement !== filters.statut) return false;
    if (filters.formation !== 'tous' && inscription.formation_titre !== filters.formation) return false;
    if (filters.search && !inscription.prenom.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Validation des inscriptions</h1>
            <p className="text-sm text-gray-500 mt-1">Validez ou refusez les demandes d'inscription des apprenants</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInscriptions.length > 0 ? (
            filteredInscriptions.map((inscription) => (
              <InscriptionCard 
                key={inscription.id} 
                inscription={inscription} 
                onStatusChange={updateInscriptionStatus}
                disabled={updating}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune inscription en attente</h3>
              <p className="mt-1 text-sm text-gray-500">Toutes les inscriptions ont été traitées.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
