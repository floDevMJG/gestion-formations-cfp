import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import {
  FiTool,
  FiUsers,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiArrowRight
} from 'react-icons/fi';

const AtelierCard = ({ atelier, index }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-blue-100 flex flex-col"
    >
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {atelier.titre}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {atelier.description}
        </p>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FiMapPin className="w-4 h-4 mr-2 text-blue-500" />
          <span>{atelier.lieu}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <FiCalendar className="w-4 h-4 mr-2 text-blue-500" />
          <span>
            {new Date(atelier.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FiClock className="w-4 h-4 mr-2 text-blue-500" />
          <span>{atelier.heure}</span>
        </div>
      </div>
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <FiUsers className="w-4 h-4 mr-2 text-purple-600" />
          <span>{atelier.participants} participants</span>
        </div>
        <button
          onClick={() => navigate(`/ateliers/${atelier.id}`)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm transition-all duration-300 transform group-hover:translate-x-1"
        >
          <span>Voir les détails</span>
          <FiArrowRight className={`w-4 h-4 ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

export default function AteliersApprenant() {
  const navigate = useNavigate();
  const [ateliers, setAteliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAteliers = async () => {
      try {
        setIsLoading(true);
        setError('');
        // Remplacer par l'API réelle pour les ateliers de l'apprenant
        const response = await API.get('/ateliers'); // Supposons une API existante /ateliers
        setAteliers(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des ateliers:', err);
        setError('Impossible de charger les ateliers. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAteliers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des ateliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Erreur</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent mb-2">
            Vos Ateliers
          </h1>
          <p className="text-gray-600">Explorez les ateliers disponibles et inscrivez-vous !</p>
        </motion.div>

        {ateliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ateliers.map((atelier, index) => (
              <AtelierCard key={atelier.id} atelier={atelier} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-12 rounded-xl shadow-lg text-center border-2 border-dashed border-blue-200"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTool className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun atelier trouvé</h3>
            <p className="text-gray-600 mb-6">Il n'y a pas encore d'ateliers disponibles pour le moment.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Retour au Tableau de bord
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
